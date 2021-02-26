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

# Configuration

## YAML

# Usage

Starging server:

```
opcache-dashboard --verbose --http-host="127.0.0.1" --http-port="42042" --pull-interval=5 --config="config.yaml"
```

Server periodically observes all of configured hosts. 
Interval of observing specified in seconds in `pull-interval` cli option of by related configuration parameter.

Also this server serves UI and API for watching gathered statistic on `http-host` and `http-port` defined in cli agruments.

# Other GUIs

* [Opcache Control Panel](https://gist.github.com/ck-on/4959032)
* [rlerdorf's opcache status](https://github.com/rlerdorf/opcache-status)
* [PeeHaa's OpCacheGUI](https://github.com/PeeHaa/OpCacheGUI)
* [opcache-gui](https://github.com/amnuts/opcache-gui)
