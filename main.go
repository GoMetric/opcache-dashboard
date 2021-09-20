package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/GoMetric/opcache-dashboard/configuration"
	"github.com/GoMetric/opcache-dashboard/metrics"
	"github.com/GoMetric/opcache-dashboard/observer"
	"github.com/GoMetric/opcache-dashboard/ui"
	"github.com/NYTimes/gziphandler"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	GoMetricStatsdClient "github.com/GoMetric/go-statsd-client"
)

// Version is a current git commit hash and tag
// Injected by compilation flag
var Version = "Unknown"

// BuildNumber is a current commit hash
// Injected by compilation flag
var BuildNumber = "Unknown"

// BuildDate is a date of build
// Injected by compilation flag
var BuildDate = "Unknown"

func main() {
	// command line options
	var configPath = flag.String("config", "", "Path to configuration")

	var httpHost = flag.String("http-host", configuration.DefaultHTTPHost, "HTTP Host for GUI and API")
	var httpPort = flag.Int("http-port", configuration.DefaultHTTPPort, "HTTP Port for GUI and API")

	var pullIntervalSeconds = flag.Int64("pull-interval", configuration.DefaultRefreshIntervalSeconds, "Pull interval in seconds")

	var statsdHost = flag.String("statsd-host", "", "StatsD Host. If empty, metric tracking will be disabled")
	var statsdPort = flag.Int("statsd-port", 0, "StatsD Port")
	var statsdMetricPrefix = flag.String("statsd-metric-prefix", "", "Prefix of metric name")

	var verbose = flag.Bool("verbose", false, "Verbose")

	var version = flag.Bool("version", false, "Show version")

	flag.Parse()

	// show version and exit
	if *version == true {
		fmt.Printf(
			"Opcache Dashboard v.%s, build %s from %s\n",
			Version,
			BuildNumber,
			BuildDate,
		)
		os.Exit(0)
	}

	// configure logging
	var logOutput io.Writer
	if *verbose == true {
		logOutput = os.Stderr
	} else {
		logOutput = ioutil.Discard
	}

	log.SetOutput(logOutput)

	// read PHP cluster configuration
	var applicationConfig configuration.ApplicationConfig

	if *configPath != "" {
		var absoluteConfigFilePath, _ = filepath.Abs(*configPath)
		var configFileExt = filepath.Ext(absoluteConfigFilePath)[1:]
		var configReader, configReadError = configuration.NewConfigReader(configFileExt)

		if configReadError != nil {
			log.Fatalln(configReadError)
			return
		}

		applicationConfig = configReader.ReadConfig(absoluteConfigFilePath)
	} else {
		log.Fatal("Config not defined")
	}

	// apply cli flags to app config
	applicationConfig.ApplyCliFlags(
		configuration.CliFlags{
			HttpHost:            httpHost,
			HttpPort:            httpPort,
			PullIntervalSeconds: pullIntervalSeconds,
			StatsdHost:          statsdHost,
			StatsdPort:          statsdPort,
			StatsdMetricPrefix:  statsdMetricPrefix,
		},
	)

	// Start PHP OPCache observing ticker
	log.Println(
		fmt.Sprintf(
			"Starting observer with refresh interval %d seconds",
			applicationConfig.PullIntervalSeconds,
		),
	)

	// Web request handler
	router := mux.NewRouter()

	// Build observer
	var o = observer.Observer{
		Clusters: applicationConfig.Clusters,
	}

	// Add StatsD sender if configured
	if applicationConfig.Metrics.Statsd != nil {
		var statsdClient = GoMetricStatsdClient.NewClient(
			applicationConfig.Metrics.Statsd.Host,
			applicationConfig.Metrics.Statsd.Port,
		)

		statsdClient.SetPrefix(applicationConfig.Metrics.Statsd.Prefix)

		statsdClient.Open()

		var statsdMetricSender = &metrics.StatsdMetricSender{
			StatsdClient: statsdClient,
		}

		o.AddMetricSender(statsdMetricSender)
	}

	// // Add prometheus sender if configured
	if applicationConfig.Metrics.Prometheus != nil {
		prometheusRegistry := prometheus.NewRegistry()
		o.AddMetricSender(metrics.NewPrometheusMetricSender(prometheusRegistry))

		router.Handle(
			"/api/nodes/statistics/prometheus",
			promhttp.HandlerFor(prometheusRegistry, promhttp.HandlerOpts{}),
		)
	}

	// opcache statistics common request handler
	router.Handle(
		"/api/nodes/statistics/opcache",
		gziphandler.GzipHandler(
			http.HandlerFunc(
				func(w http.ResponseWriter, r *http.Request) {
					var jsonBody []byte

					if r.URL.Query().Get("pretty") == "1" {
						jsonBody, _ = json.MarshalIndent(o.GetOpcacheStatistics(), "", "    ")
					} else {
						jsonBody, _ = json.Marshal(o.GetOpcacheStatistics())
					}

					w.Write(jsonBody)
				},
			),
		),
	)

	// APCu statistics request handler
	router.Handle(
		"/api/nodes/statistics/apcu",
		gziphandler.GzipHandler(
			http.HandlerFunc(
				func(w http.ResponseWriter, r *http.Request) {
					var jsonBody []byte

					if r.URL.Query().Get("pretty") == "1" {
						jsonBody, _ = json.MarshalIndent(o.GetApcuStatistics(), "", "    ")
					} else {
						jsonBody, _ = json.Marshal(o.GetApcuStatistics())
					}

					w.Write(jsonBody)
				},
			),
		),
	)

	// re-read opcache stat from agents
	router.HandleFunc(
		"/api/nodes/statistics/refresh",
		func(w http.ResponseWriter, r *http.Request) {
			go o.PullAgents()
			w.Write([]byte("OK"))
		},
	)

	// reset opcache on php node
	router.HandleFunc(
		"/api/nodes/{clusterName}/{groupName}/{hostName}/resetOpcache",
		func(w http.ResponseWriter, r *http.Request) {
			vars := mux.Vars(r)

			go o.ResetOpcache(
				vars["clusterName"],
				vars["groupName"],
				vars["hostName"],
			)

			w.Write([]byte("OK"))
		},
	)

	// api status
	router.HandleFunc(
		"/api/status",
		func(w http.ResponseWriter, r *http.Request) {
			heartbeat := map[string]interface{}{
				"version":          Version,
				"buildDate":        BuildDate,
				"buildNumber":      BuildNumber,
				"lastStatusUpdate": o.LastStatusUpdate,
			}

			heartbeatJson, _ := json.Marshal(heartbeat)

			w.Write(heartbeatJson)
		},
	)

	// user interface assets
	router.PathPrefix("/assets/").Handler(
		http.StripPrefix("/assets/", http.FileServer(ui.AssetFile())),
	)

	// frontend routes handler
	router.PathPrefix("/").HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			var indexBody, _ = ui.Asset("index.html")
			w.Write(indexBody)
		},
	)

	// start pulling data from agents
	o.StartPulling(applicationConfig.PullIntervalSeconds * int64(time.Second))

	// HTTP server
	var httpAddress = fmt.Sprintf("%s:%d", applicationConfig.UI.Host, applicationConfig.UI.Port)

	httpServer := &http.Server{
		Addr:           httpAddress,
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	log.Printf("Starting HTTP server at %s", httpAddress)

	// start listening server
	go func() {
		log.Fatal(httpServer.ListenAndServe())
	}()

	// gracefull shutdown
	gracefullStopSignalHandler := make(chan os.Signal, 1)
	signal.Notify(gracefullStopSignalHandler, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	// Block until we receive our signal.
	<-gracefullStopSignalHandler
	log.Printf("Stopping server")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer func() {
		cancel()
	}()

	httpServer.Shutdown(ctx)

	log.Printf("Server stopped successfully")

	os.Exit(0)
}
