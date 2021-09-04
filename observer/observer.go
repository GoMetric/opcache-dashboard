package observer

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/GoMetric/opcache-dashboard/configuration"
)

// Observer periodically reads status of observable nodes and aggregates received data
type Observer struct {
	metricSenders    []MetricSenderInterface
	agentPullTicker  *time.Ticker
	opcacheStatuses  ClustersOpcacheStatuses
	apcuStatuses     ClustersApcuStatuses
	parser           AgentMessageParser
	Clusters         map[string]configuration.ClusterConfig
	LastStatusUpdate time.Time
}

type NodeStatistics struct {
	OpcacheStatistics NodeOpcacheStatus
	ApcuStatistics    NodeApcuStatus
}

func NewObserver(clusters map[string]configuration.ClusterConfig) *Observer {
	var observer = Observer{
		Clusters: clusters,
		parser:   AgentMessageParser{},
	}

	return &observer
}

func (o *Observer) AddMetricSender(metricSender MetricSenderInterface) {
	o.metricSenders = append(o.metricSenders, metricSender)
}

// StartPulling observing of configured nodes
func (o *Observer) StartPulling(
	refreshIntervalNanoSeconds int64,
) {
	// init statuses structure
	o.opcacheStatuses = ClustersOpcacheStatuses{}
	o.apcuStatuses = ClustersApcuStatuses{}

	for clusterName, clusterConfig := range o.Clusters {
		o.opcacheStatuses[clusterName] = map[string]map[string]NodeOpcacheStatus{}
		o.apcuStatuses[clusterName] = map[string]map[string]NodeApcuStatus{}

		for groupName, groupConfig := range clusterConfig.Groups {
			o.opcacheStatuses[clusterName][groupName] = map[string]NodeOpcacheStatus{}
			o.apcuStatuses[clusterName][groupName] = map[string]NodeApcuStatus{}

			for _, host := range groupConfig.Hosts {
				o.opcacheStatuses[clusterName][groupName][host] = NodeOpcacheStatus{}
				o.apcuStatuses[clusterName][groupName][host] = NodeApcuStatus{}
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

// GetOpcacheStatistics returns pulled opcache statuses for all clusters
func (o *Observer) GetOpcacheStatistics() ClustersOpcacheStatuses {
	return o.opcacheStatuses
}

// GetApcuStatistics returns pulled APCu statuses for all clusters
func (o *Observer) GetApcuStatistics() ClustersApcuStatuses {
	return o.apcuStatuses
}

func (o *Observer) ResetOpcache(clusterName string, groupName string, hostName string) error {
	groupConfig := o.Clusters[clusterName].Groups[groupName]

	pullAgentURL := o.buildPullAgentUrl(groupConfig.UrlPattern, hostName) + "?command=reset"

	log.Printf(fmt.Sprintf("Reseting node opcache %s", pullAgentURL))

	response, error := http.Get(pullAgentURL)

	if error != nil {
		return error
	}

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("Observable node return error %s", response.Status)
	}

	o.pullAgent(
		groupConfig,
		clusterName,
		groupName,
		hostName,
	)

	return nil
}

func (o *Observer) pullAgentsOnTick() {
	for ; true; <-o.agentPullTicker.C {
		o.PullAgents()
	}
}

// PullAgents fetches data from all agents and store it to internal struct
func (o *Observer) PullAgents() {
	for clusterName, clusterConfig := range o.Clusters {
		for groupName, groupConfig := range clusterConfig.Groups {
			for _, host := range groupConfig.Hosts {
				o.pullAgent(
					groupConfig,
					clusterName,
					groupName,
					host,
				)
			}
		}
	}
}

func (o *Observer) pullAgent(
	groupConfig configuration.GroupConfig,
	clusterName string,
	groupName string,
	host string,
) {
	var observableNodeStatistics, err = o.fetchNodeStatistics(
		groupConfig.UrlPattern,
		host,
		groupConfig.BasicAuthCredentials,
	)

	if err != nil {
		log.Println(fmt.Sprintf("%v", err))
		return
	}

	// add fetched node opcache status to collection
	o.opcacheStatuses[clusterName][groupName][host] = observableNodeStatistics.OpcacheStatistics

	// add fetched node APCu status to collection
	o.apcuStatuses[clusterName][groupName][host] = observableNodeStatistics.ApcuStatistics

	// set last update time
	o.LastStatusUpdate = time.Now()

	// track metrics
	for _, metricSender := range o.metricSenders {
		metricSender.Send(clusterName, groupName, host, *observableNodeStatistics)
	}
}

func (o *Observer) fetchNodeStatistics(
	urlPattern string,
	host string,
	basicAuthCredentials *configuration.BasicAuthCredentials,
) (*NodeStatistics, error) {
	// build agent url
	pullAgentURL := o.buildPullAgentUrl(urlPattern, host) + "?scripts=1"
	log.Printf(fmt.Sprintf("Observing %s", pullAgentURL))

	// build request
	httpClient := &http.Client{}
	request, error := http.NewRequest("GET", pullAgentURL, nil)

	if basicAuthCredentials != nil {
		request.SetBasicAuth(basicAuthCredentials.User, basicAuthCredentials.Password)
	}

	// send request
	response, error := httpClient.Do(request)

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

	var observableNodeStatistics, err = o.parser.Parse(body)

	if err != nil {
		return nil, fmt.Errorf("Can not parse response: %v", err)
	}

	return observableNodeStatistics, nil
}

func (o *Observer) buildPullAgentUrl(urlPattern string, host string) string {
	urlPatternReplacer := strings.NewReplacer("{host}", host)
	agentURL := urlPatternReplacer.Replace(urlPattern)

	return agentURL
}
