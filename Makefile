# build version
VERSION=`git describe --tags | awk -F'-' '{print $$1}'`
BUILD_NUMBER=`git rev-parse HEAD`
BUILD_DATE=`date +%Y-%m-%d-%H:%M`

BINARY_NAME=opcache-dashboard

# CURRENT_DIR=$(dir $(abspath $(firstword $(MAKEFILE_LIST))))

LDFLAGS=-ldflags "-X main.Version=$(VERSION) -X main.BuildNumber=$(BUILD_NUMBER) -X main.BuildDate=$(BUILD_DATE)"

# Default task
default: build

# Install deprendencies
deps:
    ifneq ($(GO111MODULE),on)
		export GOPATH=$(CURDIR)
		go get -v -t -d ./...
    endif

# Build frontend for production
assets-build-prod:
	cd ui/assets &&	yarn install --production && yarn run build-prod

# Build frontend for development
assets-build-debug:
	cd ui/assets &&	yarn install && yarn run build-dev

# Watch frontend file changes for development
assets-watch: assets-build-debug
	cd ui/assets &&	yarn run watch

# Embed the assets to binary
assets-embed-prod: assets-build-prod
	go-bindata -fs -o ui/assets.go -pkg ui -prefix "ui/assets/dist" ui/assets/dist/...

# Do not embed the assets, but provide the embedding API. Contents will still be loaded from disk
assets-embed-debug: assets-build-debug 
	go-bindata -fs -o ui/assets.go -pkg ui -prefix "ui/assets/dist" -debug ui/assets/dist/...

# Run debug server with current Go code and rebuilded ui assets loaded from disc instead of embedding
# May be used for frash build of server and assets, or for just frontend development when
# restarting go server not required (in this case user "assets-watch")
start-fresh-debug-server: deps assets-embed-debug start-debug-server

# Run debug server with current Go code and current ui assets loaded from disc instead of embedding
# May be used together with "assets-watch" when restartiong of go server required
start-debug-server:
	go run ${CURDIR}/main.go --verbose --pull-interval=5 --config="${CURDIR}/example/config.yaml"

# Run PHP server for demo mode
start-stub-php-server:
	php -S 127.0.0.1:9999 ${CURDIR}/agent/agent-pull.php

# Show profiler results in web
run-profiler-web:
	go tool pprof -http=localhost:6061 http://localhost:6060/debug/pprof/profile

# Build server for production
build: deps assets-embed-prod
	CGO_ENABLED=0 go build -v -x -a $(LDFLAGS) -o $(CURDIR)/bin/$(BINARY_NAME)
	chmod +x $(CURDIR)/bin/$(BINARY_NAME)

# Clean all generated files
clean:
	rm -rf $(CURDIR)/bin/*
	rm -rf $(CURDIR)/ui/assets.go
	rm -rf $(CURDIR)/ui/assets/node_modules/*
	rm -rf $(CURDIR)/ui/assets/dist/*
	go clean

# Install binary locally
install:
	cp $(CURDIR)/bin/$(BINARY_NAME) /usr/local/bin

# to publish to docker registry we need to be logged in
docker-login:
    ifdef DOCKER_REGISTRY_USERNAME
		@echo "h" $(DOCKER_REGISTRY_USERNAME) "h"
    else
		docker login
    endif

# build docker images
docker-build:
	docker build --tag gometric/opcache-dashboard:latest -f ./Dockerfile.alpine .
	docker build --tag gometric/opcache-dashboard:$(VERSION) -f ./Dockerfile.alpine .

# publish docker images to hub
docker-publish: docker-build
	docker login
	docker push gometric/opcache-dashboard:latest
	docker push gometric/opcache-dashboard:$(VERSION)
