package metrics

import (
	"strings"

	statsd "github.com/GoMetric/go-statsd-client"
	"github.com/GoMetric/opcache-dashboard/opcachestatus"
)

type StatsdMetricSender struct {
	StatsdClient *statsd.Client
}

func (s *StatsdMetricSender) Send(
	clusterName string,
	groupName string,
	hostName string,
	nodeOpcacheStatus opcachestatus.NodeOpcacheStatus,
) {
	clusterName = strings.ReplaceAll(clusterName, ".", "-")
	groupName = strings.ReplaceAll(groupName, ".", "-")
	hostName = strings.ReplaceAll(hostName, ".", "-")
	var metricPrefix = clusterName + "." + groupName + "." + hostName + "."

	metricKeyValueMap := map[string]int{
		"scripts.count":    len(nodeOpcacheStatus.Scripts),
		"memory.free":      nodeOpcacheStatus.Memory.Free,
		"memory.used":      nodeOpcacheStatus.Memory.Used,
		"memory.wasted":    nodeOpcacheStatus.Memory.Wasted,
		"keys.free":        nodeOpcacheStatus.Keys.Free,
		"keys.usedKeys":    nodeOpcacheStatus.Keys.UsedKeys,
		"keys.usedScripts": nodeOpcacheStatus.Keys.UsedScripts,
		"keyHits.misses":   nodeOpcacheStatus.KeyHits.Misses,
	}

	for metricKey, metricValue := range metricKeyValueMap {
		s.StatsdClient.Gauge(
			metricPrefix+metricKey,
			metricValue,
		)
	}
}
