package configuration

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type yamlConfig struct {
	PullIntervalSeconds *int64                       `yaml:"pullInterval"`
	Clusters            map[string]yamlClusterConfig `yaml:"clusters"`
	UI                  *yamlUIConfig                `yaml:"ui"`
	Metrics             *yamlMetricsConfig           `yaml:"metrics"`
}

type yamlClusterConfig struct {
	Groups map[string]yamlGroupConfig `yaml:"groups"`
}

type yamlGroupConfig struct {
	UrlPattern           string                    `yaml:"urlPattern"`
	Hosts                []string                  `yaml:"hosts"`
	BasicAuthCredentials *yamlBasicAuthCredentials `yaml:"basicAuth"`
}

type yamlBasicAuthCredentials struct {
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

type yamlUIConfig struct {
	Host *string `yaml:"host"`
	Port *int    `yaml:"port"`
}

type yamlMetricsConfig struct {
	Statsd     *yamlStatsdMetricsConfig     `yaml:"statsd"`
	Prometheus *yamlPrometheusMetricsConfig `yaml:"prometheus"`
}

type yamlStatsdMetricsConfig struct {
	Enabled bool    `yaml:"enabled"`
	Host    string  `yaml:"host"`
	Port    *int    `yaml:"port"`
	Prefix  *string `yaml:"prefix"`
}

type yamlPrometheusMetricsConfig struct {
	Enabled bool    `yaml:"enabled"`
	Prefix  *string `yaml:"prefix"`
}

// YAMLConfigReader reads configuration in YAML format
type YAMLConfigReader struct {
}

// ReadConfig reads yaml configuration file and produces application configuration
func (reader *YAMLConfigReader) ReadConfig(path string) ApplicationConfig {
	// check file existence
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
		PullIntervalSeconds: DefaultRefreshIntervalSeconds,
		Clusters:            map[string]ClusterConfig{},
		Metrics:             MetricsConfig{},
		UI: UIConfig{
			Host: DefaultHTTPHost,
			Port: DefaultHTTPPort,
		},
	}

	// Interval
	if yamlConfig.PullIntervalSeconds != nil {
		config.PullIntervalSeconds = *yamlConfig.PullIntervalSeconds
	}

	// PHP Node Cluster
	for clusterName, yamlClusterConfig := range yamlConfig.Clusters {
		config.Clusters[clusterName] = ClusterConfig{
			Groups: map[string]GroupConfig{},
		}

		for groupName, yamlGroupConfig := range yamlClusterConfig.Groups {
			clusterGroupConfig := GroupConfig{
				UrlPattern:           yamlGroupConfig.UrlPattern,
				Hosts:                yamlGroupConfig.Hosts,
				BasicAuthCredentials: nil,
			}

			if yamlGroupConfig.BasicAuthCredentials != nil {
				clusterGroupConfig.BasicAuthCredentials = &BasicAuthCredentials{
					User:     yamlGroupConfig.BasicAuthCredentials.User,
					Password: yamlGroupConfig.BasicAuthCredentials.Password,
				}
			}

			config.Clusters[clusterName].Groups[groupName] = clusterGroupConfig
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
			config.Metrics.Statsd = &StatsdMetricsConfig{
				Host:   yamlConfig.Metrics.Statsd.Host,
				Prefix: "",
			}

			if yamlConfig.Metrics.Statsd.Port != nil {
				config.Metrics.Statsd.Port = *yamlConfig.Metrics.Statsd.Port
			} else {
				config.Metrics.Statsd.Port = DefaultStatsdPort
			}

			if yamlConfig.Metrics.Statsd.Prefix != nil {
				config.Metrics.Statsd.Prefix = *yamlConfig.Metrics.Statsd.Prefix
			}
		}

		if yamlConfig.Metrics.Prometheus != nil && yamlConfig.Metrics.Prometheus.Enabled {
			config.Metrics.Prometheus = &PrometheusMetricsConfig{
				Prefix: "",
			}

			if yamlConfig.Metrics.Prometheus.Prefix != nil {
				config.Metrics.Prometheus.Prefix = *yamlConfig.Metrics.Prometheus.Prefix
			}
		}
	}

	return config
}
