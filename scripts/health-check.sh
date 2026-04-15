#!/usr/bin/env bash

set -euo pipefail

URL="${1:-${ORANGEHRM_BASE_URL:-https://opensource-demo.orangehrmlive.com}}"
MAX_ATTEMPTS="${HEALTH_CHECK_MAX_ATTEMPTS:-15}"
BASE_DELAY="${HEALTH_CHECK_BASE_DELAY_SECONDS:-2}"
MAX_DELAY="${HEALTH_CHECK_MAX_DELAY_SECONDS:-30}"
CONNECT_TIMEOUT="${HEALTH_CHECK_CONNECT_TIMEOUT_SECONDS:-5}"
MAX_TIME="${HEALTH_CHECK_MAX_TIME_SECONDS:-20}"

attempt=1

while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  echo "[health-check] Attempt ${attempt}/${MAX_ATTEMPTS} -> ${URL}"

  if curl --silent --show-error --fail --location \
    --connect-timeout "$CONNECT_TIMEOUT" \
    --max-time "$MAX_TIME" \
    "$URL" >/dev/null; then
    echo "[health-check] ✅ Service is reachable"
    exit 0
  fi

  if [ "$attempt" -eq "$MAX_ATTEMPTS" ]; then
    break
  fi

  delay=$((BASE_DELAY * (2 ** (attempt - 1))))
  if [ "$delay" -gt "$MAX_DELAY" ]; then
    delay="$MAX_DELAY"
  fi

  echo "[health-check] ❌ Attempt ${attempt} failed. Retrying in ${delay}s..."
  sleep "$delay"
  attempt=$((attempt + 1))
done

echo "[health-check] 🚨 Service unavailable after ${MAX_ATTEMPTS} attempts"
exit 1
