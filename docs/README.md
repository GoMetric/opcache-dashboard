# Opcache Dashboard

Gathers OPcache and APCu statistics from different PHP servers into one dashboard and tracks metrics to statsD and Prometheus.

![Opcache dashboard](https://github.com/GoMetric/opcache-dashboard/blob/master/docs/screenshot.png?raw=true&1)

# Installation

## Installation from sources

Clone this repository and than build:

```
make
```

Compiled binary may be installed:

```
make install
```

## Docker image

Also available [Docker image](https://hub.docker.com/r/gometric/opcache-dashboard/):

[![docker](https://img.shields.io/docker/pulls/gometric/opcache-dashboard.svg?style=flat)](https://hub.docker.com/r/gometric/opcache-dashboard/)

```
docker run \
  -p 42042:42042 \
  -v "$(pwd)"/config.yaml:/config.yaml:ro \
  gometric/opcache-dashboard:latest \
  --config="/config.yaml"
```

# Configuration

## YAML

Example of configuration:

```yaml
pullInterval: 5 # pull data from agent every 5 seconds

clusters: # cluster consists of node groups that share sabe codebase
  myproject1: # name of cluster
    groups: # group consists of nodes with same behavior
      common: # name of group
        urlPattern: "http://{host}:9999/agent-pull.php"
        basicAuth: # optional, if Basic Auth required by endpoint
          user: someuser
          password: somepassword
        hosts: # list of php nodes
          - "127.0.0.1"
  myproject2:
    groups:
      web:
        urlPattern: "http://{host}:9999/agent-pull.php"
        hosts: 
          - "127.0.0.1"

ui: # http host and port to serve ui and api requests
  host: 127.0.0.1
  port: 42042

metrics: # tool may send metrics to different backends
  statsd: # tool sends metrics to statsd
    enabled: false
    host: 127.0.0.1 # statsd host
    port: 8125 # statsd port
    prefix: some.metric.prefix # prefix addet to all metrics
  prometheus: # tool collects metrics, prometheus goest to metric url and scrapps data
    enabled: true
```

# Usage

Starting server:

```
opcache-dashboard \
  --verbose \
  --http-host="127.0.0.1" \
  --http-port="42042" \
  --pull-interval=5 \
  --config="config.yaml"
```

Server periodically observes all of configured hosts. 
Interval of observing specified in seconds in `pull-interval` cli option of by related configuration parameter.

Also this server serves UI and API for watching gathered statistic on `http-host` and `http-port` defined in cli arguments.

# Metrics

## Prometheus

Prometheus metrics available on API endpoint `/api/nodes/statistics/prometheus`.

# Localisation

You may contribute to project localisation at https://www.transifex.com/gometric/opcache-dashboard