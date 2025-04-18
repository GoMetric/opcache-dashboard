package metrics

import (
	"log"
	"strings"

	"github.com/GoMetric/opcache-dashboard/observer"
	"github.com/prometheus/client_golang/prometheus"
)

type PrometheusMetricSender struct {
	gauges map[string]prometheus.GaugeVec
	Prefix string
}

func NewPrometheusMetricSender(
	registry *prometheus.Registry,
	prefix string,
) *PrometheusMetricSender {
	sender := PrometheusMetricSender{
		gauges: map[string]prometheus.GaugeVec{},
	}

	sender.Prefix = prefix

	gaugeNames := []string{
		"opcache_scripts_count",
		"opcache_memory_free_bytes",
		"opcache_memory_used_bytes",
		"opcache_memory_wasted_bytes",
		"opcache_keys_free",
		"opcache_keys_usedKeys",
		"opcache_keys_usedScripts",
		"opcache_keyHits_misses",
		"apcu_memory_free_bytes",
	}

	for _, gaugeName := range gaugeNames {
		fullGaugeName := sender.Prefix + "_" + gaugeName

		sender.gauges[fullGaugeName] = *prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: fullGaugeName,
				Help: gaugeName,
			},
			[]string{"clusterName", "groupName", "hostName"},
		)

		registry.MustRegister(sender.gauges[fullGaugeName])
	}

	return &sender
}

func (s *PrometheusMetricSender) Send(
	clusterName string,
	groupName string,
	hostName string,
	nodeStatistics observer.NodeStatistics,
) {
	nodeOpcacheStatus := nodeStatistics.OpcacheStatistics
	nodeApcuStatus := nodeStatistics.ApcuStatistics

	clusterName = strings.ReplaceAll(clusterName, ".", "-")
	groupName = strings.ReplaceAll(groupName, ".", "-")
	hostName = strings.ReplaceAll(hostName, ".", "-")

	gaugeNameValueMap := map[string]int{
		"opcache_scripts_count":       len(nodeOpcacheStatus.Scripts),
		"opcache_memory_free_bytes":   nodeOpcacheStatus.Memory.Free,
		"opcache_memory_used_bytes":   nodeOpcacheStatus.Memory.Used,
		"opcache_memory_wasted_bytes": nodeOpcacheStatus.Memory.Wasted,
		"opcache_keys_free":           nodeOpcacheStatus.Keys.Free,
		"opcache_keys_usedKeys":       nodeOpcacheStatus.Keys.UsedKeys,
		"opcache_keys_usedScripts":    nodeOpcacheStatus.Keys.UsedScripts,
		"opcache_keyHits_misses":      nodeOpcacheStatus.KeyHits.Misses,
	}

	// if APCU enabled, add statistics
	if nodeApcuStatus.Enabled {
		gaugeNameValueMap["apcu_memory_free_bytes"] = nodeApcuStatus.SmaInfo.AvailMem
	}

	for gaugeName, gaugeValue := range gaugeNameValueMap {
		fullGaugeName := s.Prefix + "_" + gaugeName

		if gauge, ok := s.gauges[fullGaugeName]; ok {
			gauge.With(
				prometheus.Labels{
					"clusterName": clusterName,
					"groupName":   groupName,
					"hostName":    hostName,
				},
			).Set(float64(gaugeValue))
		} else {
			log.Printf("Gauge %s not declared but used", gaugeName)
		}
	}
}
