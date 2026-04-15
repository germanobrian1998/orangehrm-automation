#!/usr/bin/env sh
set -eu

BASE_URL="${ORANGEHRM_BASE_URL:-https://opensource-demo.orangehrmlive.com}"
MAX_RETRIES="${HEALTHCHECK_MAX_RETRIES:-15}"
INITIAL_DELAY="${HEALTHCHECK_INITIAL_DELAY_SECONDS:-2}"
MAX_DELAY="${HEALTHCHECK_MAX_DELAY_SECONDS:-30}"
REQUEST_TIMEOUT="${HEALTHCHECK_REQUEST_TIMEOUT_SECONDS:-30}"
TARGET_PATH="${HEALTHCHECK_PATH:-/web/index.php/auth/login}"

attempt=1
delay="$INITIAL_DELAY"

while [ "$attempt" -le "$MAX_RETRIES" ]; do
  if curl --silent --show-error --fail --max-time "$REQUEST_TIMEOUT" "${BASE_URL%/}${TARGET_PATH}" >/dev/null; then
    echo "Health check passed on attempt ${attempt}/${MAX_RETRIES}"
    exit 0
  fi

  if [ "$attempt" -eq "$MAX_RETRIES" ]; then
    break
  fi

  echo "Health check attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delay}s..."
  sleep "$delay"

  delay=$((delay * 2))
  if [ "$delay" -gt "$MAX_DELAY" ]; then
    delay="$MAX_DELAY"
  fi

  attempt=$((attempt + 1))
done

echo "OrangeHRM health check failed after ${MAX_RETRIES} attempts for ${BASE_URL%/}${TARGET_PATH}"
exit 1
