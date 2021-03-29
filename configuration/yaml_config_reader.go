package configuration

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type yamlConfig struct {
	PullInterval *int64                       `yaml:"pullInterval"`
	Clusters     map[string]yamlClusterConfig `yaml:"clusters"`
	UI           *yamlUIConfig                `yaml:"ui"`
	Metrics      *yamlMetricsConfig           `yaml:"metrics"`
}

type yamlClusterConfig struct {
	Groups map[string]yamlGroupConfig `yaml:"groups"`
}

type yamlGroupConfig struct {
	Agent  AgentType `yaml:"agent"`
	Path   string    `yaml:"path"`
	Secure bool      `yaml:"secure"`
	Port   int       `yaml:"port"`
	Hosts  []string  `yaml:"hosts"`
}

type yamlUIConfig struct {
	Host *string `yaml:"host"`
	Port *int    `yaml:"port"`
}

type yamlMetricsConfig struct {
	Statsd     *yamlStatsdMetricsConfig     `yaml:"host"`
	Prometheus *yamlPrometheusMetricsConfig `yaml:"port"`
}

type yamlStatsdMetricsConfig struct {
	Enabled bool   `yaml:"enabled"`
	Host    string `yaml:"host"`
	Port    *int   `yaml:"port"`
	Prefix  string `yaml:"prefix"`
}

type yamlPrometheusMetricsConfig struct {
	Enabled bool `yaml:"enabled"`
}

// YAMLConfigReader reads configuration in YAML format
type YAMLConfigReader struct {
}

// ReadConfig reads yaml configuration file and produces application configuration
func (reader *YAMLConfigReader) ReadConfig(path string) ApplicationConfig {
	// check file existance
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		log.Fatalln(fmt.Sprintf("Config file '%s' not found", path))
	} else {
		log.Println(fmt.Sprintf("Reading configuration from '%s'", path))
	}

	// read file
	fileContent, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatalf("Can not read configuration file: %v", err)
	}

	// unmarshal file
	yamlConfig := yamlConfig{}
	err = yaml.Unmarshal(fileContent, &yamlConfig)
	if err != nil {
		log.Fatalf("Can not parse yaml configuration: %v", err)
	}

	// check if parsed successfully
	if len(yamlConfig.Clusters) == 0 {
		log.Fatalf("Cluster configuration not found in config")
	}

	// build config of observable nodes
	config := ApplicationConfig{
		PullInterval: DefaultRefreshIntervalSeconds,
		Clusters:     map[string]ClusterConfig{},
		Metrics:      MetricsConfig{},
		UI: UIConfig{
			Host: DefaultHTTPHost,
			Port: DefaultHTTPPort,
		},
	}

	// Interval
	if yamlConfig.PullInterval != nil {
		config.PullInterval = *yamlConfig.PullInterval
	}

	// PHP Node Cluster
	for clusterName, yamlClusterConfig := range yamlConfig.Clusters {
		config.Clusters[clusterName] = ClusterConfig{
			Groups: map[string]GroupConfig{},
		}

		for groupName, yamlGroupConfig := range yamlClusterConfig.Groups {
			config.Clusters[clusterName].Groups[groupName] = GroupConfig{
				Agent:  yamlGroupConfig.Agent,
				Path:   yamlGroupConfig.Path,
				Secure: yamlGroupConfig.Secure,
				Port:   yamlGroupConfig.Port,
				Hosts:  yamlGroupConfig.Hosts,
			}
		}
	}

	// UI
	if yamlConfig.UI != nil {
		if yamlConfig.UI.Host != nil {
			config.UI.Host = *yamlConfig.UI.Host
		}

		if yamlConfig.UI.Port != nil {
			config.UI.Port = *yamlConfig.UI.Port
		}
	}

	// Metrics
	if yamlConfig.Metrics != nil {
		if yamlConfig.Metrics.Statsd != nil && yamlConfig.Metrics.Statsd.Enabled {
			config.Metrics.Statsd = &StatsdMetricsConfig{}

			config.Metrics.Statsd.Host = yamlConfig.Metrics.Statsd.Host

			if yamlConfig.Metrics.Statsd.Port != nil {
				config.Metrics.Statsd.Port = *yamlConfig.Metrics.Statsd.Port
			} else {
				config.Metrics.Statsd.Port = DefaultStatsdPort
			}

			config.Metrics.Statsd.Prefix = yamlConfig.Metrics.Statsd.Prefix
		}

		if yamlConfig.Metrics.Prometheus != nil {
			config.Metrics.Prometheus = &PrometheusMetricsConfig{}
		}
	}

	return config
}
