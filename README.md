# Opcache Dashboard

Gathers opcache stat from different PHP servers into one dashboard and tracks opcache status metrics to statsD

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
  -v "$(pwd)/"/config.yaml:/config.yaml:ro \
  gometric/opcache-dashboard:latest \
  --config="/config.yaml"
```

# Configuration

## YAML

Example of configuration:

```yaml
pullInterval: 5

clusters:

  myproject1:
    groups:
      web:
        agent: "pull"
        path: "/"
        secure: false
        port: 9999
        hosts: 
          - "127.0.0.1"

  myproject2:
    groups:
      web:
        agent: "pull"
        path: "/"
        secure: false
        port: 9999
        hosts: 
          - "127.0.0.1"
      cron:
        agent: "push"
        hosts: 
          - "127.0.0.1"
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

Also this server serves UI and API for watching gathered statistic on `http-host` and `http-port` defined in cli agruments.

# Other GUIs

* [Opcache Control Panel](https://gist.github.com/ck-on/4959032)
* [rlerdorf's opcache status](https://github.com/rlerdorf/opcache-status)
* [PeeHaa's OpCacheGUI](https://github.com/PeeHaa/OpCacheGUI)
* [opcache-gui](https://github.com/amnuts/opcache-gui)
