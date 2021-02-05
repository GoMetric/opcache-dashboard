package configuration

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// YAMLConfigReader reads configuration in YAML format
type YAMLConfigReader struct {
}

type yamlConfig struct {
	PullInterval int64                        `yaml:"pullInterval"`
	Clusters     map[string]yamlClusterConfig `yaml:"clusters"`
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
		Clusters: map[string]ClusterConfig{},
	}

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

	return config
}
