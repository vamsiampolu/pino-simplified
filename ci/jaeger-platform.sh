#!/usr/bin/env bash

# fail on first error
set -o errexit
set -o nounset
set -o pipefail

source ./ci/logger.sh
source ./ci/docker-utils.sh

jaeger_platform=jaegertracing/all-in-one:1.6
hotrod_example=jaegertracing/example-hotrod:1.6

start_platform() {
   docker run -d --name jaeger \
	   -p 6831:6831/udp \
	   -p 16686:16686 \
	   -p 14268:14268 \
	  "${jaeger_platform}" 
}

start_example() {
  docker run --rm -it \
	  --link jaeger \
	  -p8080-8083:8080-8083 \
	  "${hotrod_example}" \
	  all \
	  --jaeger-agent.host-port=jaeger:6831 
}

run_example() {
 example-hotrod all
}

main() {
  if ! container_exists "${jaeger_platform}"; then
    log_info "Start the jaeger tracing platform"
    start_platform
  fi

  if ! container_exists "${hotrod_example}"; then
    log_info "Start the HotRod Example Application"
    start_example
  fi 

  log_info "Run the HotRoD example"
  run_example
}

main

