package opcachestatus

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/GoMetric/go-statsd-client"
	"github.com/sokil/OpcacheDashboard/configuration"
)

// Observer periodically reads status of observable nodes and aggregates received data
type Observer struct {
	metricTracker   *statsd.Client
	agentPullTicker *time.Ticker
	statuses        ClustersOpcacheStatuses
	Clusters        map[string]configuration.ClusterConfig
}

func (o *Observer) SetMetricTracker(metricTracker *statsd.Client) {
	o.metricTracker = metricTracker
}

// StartPulling observing of configured nodes
func (o *Observer) StartPulling(
	refreshIntervalNanoSeconds int64,
) {
	// init statuses structure
	o.statuses = ClustersOpcacheStatuses{}

	for clusterName, clusterConfig := range o.Clusters {
		o.statuses[clusterName] = map[string]map[string]NodeOpcacheStatus{}

		for groupName, groupConfig := range clusterConfig.Groups {
			o.statuses[clusterName][groupName] = map[string]NodeOpcacheStatus{}

			for _, host := range groupConfig.Hosts {
				o.statuses[clusterName][groupName][host] = NodeOpcacheStatus{}
			}
		}
	}

	// start ticker
	o.agentPullTicker = time.NewTicker(time.Duration(refreshIntervalNanoSeconds))

	// start observing nodes on tick
	go o.pullAgentsOnTick()
}

// StopPulling stops observing ticker
func (o *Observer) StopPulling() {
	o.agentPullTicker.Stop()
}

// GetStatuses returns pulled statuses for all clusters
func (o *Observer) GetStatuses() ClustersOpcacheStatuses {
	return o.statuses
}

func (o *Observer) pullAgentsOnTick() {
	for ; true; <-o.agentPullTicker.C {
		o.PullAgents()
	}
}

func (o *Observer) PullAgents() {
	for clusterName, clusterConfig := range o.Clusters {
		for groupName, groupConfig := range clusterConfig.Groups {
			if groupConfig.Agent != configuration.PullAgentType {
				continue
			}

			for _, host := range groupConfig.Hosts {
				var observableNodeOpcacheStatus, err = o.fetchNodeOpcacheStatus(
					host,
					groupConfig.Port,
					groupConfig.Path,
					groupConfig.Secure,
				)

				if err != nil {
					log.Println(fmt.Sprintf("%v", err))
					continue
				}

				// track metrics
				o.trackNodeMetrics(clusterName, groupName, host, *observableNodeOpcacheStatus)

				// add fetched node status to collection
				o.statuses[clusterName][groupName][host] = *observableNodeOpcacheStatus
			}
		}
	}
}

func (o *Observer) trackNodeMetrics(
	clusterName string,
	groupName string,
	host string,
	observableNodeOpcacheStatus NodeOpcacheStatus,
) {
	if o.metricTracker != nil {
		var hostName = strings.ReplaceAll(host, ".", "-")
		var metricPrefix = clusterName + "." + groupName + "." + hostName + "."

		o.metricTracker.Gauge(
			metricPrefix+"scripts.count",
			len(observableNodeOpcacheStatus.Scripts),
		)
	}
}

func (o *Observer) fetchNodeOpcacheStatus(
	host string,
	port int,
	path string,
	secure bool,
) (*NodeOpcacheStatus, error) {
	var pullAgentURL = ""

	var schema string

	if secure {
		schema += "https"
	} else {
		schema += "http"
	}

	pullAgentURL = fmt.Sprintf("%s://%s:%d%s", schema, host, port, path)

	log.Printf(fmt.Sprintf("Observing %s", pullAgentURL))

	response, error := http.Get(pullAgentURL)

	if error != nil {
		return nil, error
	}

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Observable node return error %s", response.Status)
	}

	body, error := ioutil.ReadAll(response.Body)

	if error != nil {
		return nil, error
	}

	var parser = AgentMessageParser{}

	var observableNodeOpcacheStatus, err = parser.Parse(body)

	if err != nil {
		return nil, fmt.Errorf("Can not parse response: %v", err)
	}

	return observableNodeOpcacheStatus, nil
}
