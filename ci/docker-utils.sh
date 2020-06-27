#!/usr/bin/env bash

# fail on first error
set -o errexit
set -o nounset
set -o pipefail

source ./ci/logger.sh

container_exists() {
  local name="$1"
  local exists 
  exists=$(docker container ls --format='{{json .Image}}' | grep "${name}")
  log_info "Name ${name}" 
  log_info "Exists ${exists}"
  if [[ "${exists}" =~ "${name}" ]]; then
    log_info "Container exists"
    return 0
  else
    log_info "Container does not exist"
    return 1
  fi
}

