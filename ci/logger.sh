#!/usr/bin/env bash

# fail on first error
set -o errexit
set -o nounset
set -o pipefail

# show colors on CI 🌈
export FORCE_COLOR=1

formatted_date() {
  date +'%Y-%m-%dT%H:%M:%S%z'
}

formatted_message() {
  messages=("${@:2}")
  level=$1
  now=$(formatted_date)
  local prefix=("[${level}: ${now}]:")
  local res=("${prefix[@]}" "${messages[@]}")
  echo "${res[@]}"
}

log_info() {
  formatted_message INFO "$@" >&1
}

log_error() {
  formatted_message ERROR "$@" >&2
}

