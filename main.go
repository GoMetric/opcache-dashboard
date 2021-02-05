package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/NYTimes/gziphandler"
	"github.com/sokil/OpcacheDashboard/configuration"
	"github.com/sokil/OpcacheDashboard/opcachestatus"
	"github.com/sokil/OpcacheDashboard/ui"

	GoMetricStatsdClient "github.com/GoMetric/go-statsd-client"
)

const defaultHTTPHost = "127.0.0.1"
const defaultHTTPPort = 42042

const defaultStatsDHost = ""
const defaultStatsDPort = 8125

const defaultRefreshIntervalSeconds = 3600

func main() {
	// command line options
	var httpHost = flag.String("http-host", defaultHTTPHost, "HTTP Host")
	var httpPort = flag.Int("http-port", defaultHTTPPort, "HTTP Port")
	var pullIntervalSeconds = flag.Int64("pull-interval", defaultRefreshIntervalSeconds, "Pull interval in seconds")
	var configPath = flag.String("config", "", "Path to configuration")
	var statsdHost = flag.String("statsd-host", defaultStatsDHost, "StatsD Host. If empty, metric tracking will be disabled")
	var statsdPort = flag.Int("statsd-port", defaultStatsDPort, "StatsD Port")
	var statsdMetricPrefix = flag.String("statsd-metric-prefix", "", "Prefix of metric name")
	var verbose = flag.Bool("verbose", false, "Verbose")

	flag.Parse()

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

	// Start PHP OPCache observing ticker
	log.Println(
		fmt.Sprintf(
			"Starting observer with refresh interval %d seconds",
			*pullIntervalSeconds,
		),
	)

	var pullIntervalNanoSeconds int64

	if applicationConfig.PullInterval > 0 {
		pullIntervalNanoSeconds = applicationConfig.PullInterval * int64(time.Second)
	} else if *pullIntervalSeconds > 0 {
		pullIntervalNanoSeconds = *pullIntervalSeconds * int64(time.Second)
	} else {
		pullIntervalNanoSeconds = 3600 * int64(time.Second)
	}

	var o = opcachestatus.Observer{
		Clusters: applicationConfig.Clusters,
	}

	if *statsdHost != "" {
		log.Println("Start metrick tracking")
		var statsDClient = GoMetricStatsdClient.NewClient(*statsdHost, *statsdPort)
		statsDClient.SetPrefix(*statsdMetricPrefix)

		o.SetMetricTracker(statsDClient)
	}

	o.StartPulling(pullIntervalNanoSeconds)

	// Request handler
	mux := http.NewServeMux()

	// api
	mux.Handle(
		"/api/nodes",
		gziphandler.GzipHandler(
			http.HandlerFunc(
				func(w http.ResponseWriter, r *http.Request) {
					var jsonBody, _ = json.MarshalIndent(o.GetStatuses(), "", "    ")
					w.Write(jsonBody)
				},
			),
		),
	)

	mux.HandleFunc(
		"/api/nodes/refresh",
		func(w http.ResponseWriter, r *http.Request) {
			go o.PullAgents()
			w.Write([]byte("OK"))
		},
	)

	// heartbeat
	mux.HandleFunc(
		"/api/heartbeat",
		func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("OK"))
		},
	)

	// user interface assets
	mux.Handle(
		"/assets/",
		http.StripPrefix("/assets/", http.FileServer(ui.AssetFile())),
	)

	// frontend routes handler
	mux.HandleFunc(
		"/",
		func(w http.ResponseWriter, r *http.Request) {
			var indexBody, _ = ui.Asset("index.html")
			w.Write(indexBody)
		},
	)

	// HTTP server
	var httpAddress = fmt.Sprintf("%s:%d", *httpHost, *httpPort)
	httpServer := &http.Server{
		Addr:           httpAddress,
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	log.Printf("Starting HTTP server at %s", httpAddress)
	log.Fatal(httpServer.ListenAndServe())
}
