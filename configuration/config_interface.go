package configuration

const DefaultHTTPHost = "127.0.0.1"
const DefaultHTTPPort = 42042

const DefaultStatsdPort = 8125

const DefaultRefreshIntervalSeconds = 3600

const DefaultPullAgentUrlPattern = ""

// ApplicationConfig represents application configuration
type ApplicationConfig struct {
	PullIntervalSeconds int64
	Clusters            map[string]ClusterConfig
	UI                  UIConfig
	Metrics             MetricsConfig
}

type ClusterConfig struct {
	Groups map[string]GroupConfig
}

type UIConfig struct {
	Host string
	Port int
}

type MetricsConfig struct {
	Statsd     *StatsdMetricsConfig
	Prometheus *PrometheusMetricsConfig
}

type StatsdMetricsConfig struct {
	Host   string
	Port   int
	Prefix string
}

type PrometheusMetricsConfig struct {
}

type AgentType string

const (
	PullAgentType AgentType = "pull"
	PushAgentType           = "push"
)

type GroupConfig struct {
	UrlPattern           string
	Agent                AgentType
	Path                 string
	Secure               bool
	Port                 int
	Hosts                []string
	BasicAuthCredentials *BasicAuthCredentials
}

type BasicAuthCredentials struct {
	User     string
	Password string
}

type CliFlafs struct {
	HttpHost            *string
	HttpPort            *int
	PullIntervalSeconds *int64
	StatsdHost          *string
	StatsdPort          *int
	StatsdMetricPrefix  *string
}

func (c *ApplicationConfig) ApplyCliFlags(flags CliFlafs) {
	if *flags.HttpHost != DefaultHTTPHost {
		c.UI.Host = *flags.HttpHost
	}

	if *flags.HttpPort != DefaultHTTPPort {
		c.UI.Port = *flags.HttpPort
	}

	if *flags.PullIntervalSeconds != DefaultRefreshIntervalSeconds {
		c.PullIntervalSeconds = *flags.PullIntervalSeconds
	}

	if *flags.StatsdHost != "" {
		if c.Metrics.Statsd == nil {
			c.Metrics.Statsd = &StatsdMetricsConfig{
				Host:   *flags.StatsdHost,
				Port:   DefaultStatsdPort,
				Prefix: "",
			}
		}

		if *flags.StatsdPort != DefaultStatsdPort {
			c.Metrics.Statsd.Port = *flags.StatsdPort
		}

		if *flags.StatsdMetricPrefix != "" {
			c.Metrics.Statsd.Prefix = *flags.StatsdMetricPrefix
		}
	}
}
