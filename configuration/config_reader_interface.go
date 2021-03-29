package configuration

import (
	"errors"
	"fmt"
)

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
