package configuration

import (
	"errors"
	"fmt"
)

// ApplicationConfig represents application configuration
type ApplicationConfig struct {
	PullInterval int64
	Clusters     map[string]ClusterConfig
}

type ClusterConfig struct {
	Groups map[string]GroupConfig
}

type AgentType string

const (
	PullAgentType AgentType = "pull"
	PushAgentType           = "push"
)

type GroupConfig struct {
	Agent  AgentType
	Path   string
	Secure bool
	Port   int
	Hosts  []string
}

// ConfigReaderInterface defines interface for reading application configuration
type ConfigReaderInterface interface {
	ReadConfig(path string) ApplicationConfig
}

// NewConfigReader created instance of configuration reader of defined format
func NewConfigReader(format string) (ConfigReaderInterface, error) {
	switch format {
	case "yaml", "yml":
		return &YAMLConfigReader{}, nil
	default:
		return nil, errors.New(fmt.Sprintf("Unknown format '%s' of configuration specified", format))
	}
}
