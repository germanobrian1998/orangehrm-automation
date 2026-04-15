#!/bin/sh

set -eu

BASE_URL="${ORANGEHRM_BASE_URL:-https://opensource-demo.orangehrmlive.com}"
TARGET_URL="${BASE_URL%/}/web/index.php/auth/login"
MAX_ATTEMPTS="${HEALTH_CHECK_MAX_ATTEMPTS:-15}"
INITIAL_TIMEOUT="${HEALTH_CHECK_INITIAL_TIMEOUT:-5}"
MAX_TIMEOUT="${HEALTH_CHECK_MAX_TIMEOUT:-20}"

attempt=1
timeout="$INITIAL_TIMEOUT"
sleep_seconds=1

echo "Starting OrangeHRM health check for ${TARGET_URL}"

while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  if curl --silent --show-error --fail --location --max-time "$timeout" "$TARGET_URL" >/dev/null 2>&1; then
    echo "✅ OrangeHRM is accessible (attempt ${attempt}/${MAX_ATTEMPTS}, timeout ${timeout}s)"
    exit 0
  fi

  if [ "$attempt" -eq "$MAX_ATTEMPTS" ]; then
    break
  fi

  echo "⏳ Attempt ${attempt}/${MAX_ATTEMPTS} failed (timeout ${timeout}s). Retrying in ${sleep_seconds}s..."
  sleep "$sleep_seconds"

  next_timeout=$((timeout * 2))
  if [ "$next_timeout" -gt "$MAX_TIMEOUT" ]; then
    timeout="$MAX_TIMEOUT"
  else
    timeout="$next_timeout"
  fi

  next_sleep=$((sleep_seconds * 2))
  if [ "$next_sleep" -gt 30 ]; then
    sleep_seconds=30
  else
    sleep_seconds="$next_sleep"
  fi

  attempt=$((attempt + 1))
done

echo "❌ OrangeHRM health check failed after ${MAX_ATTEMPTS} attempts"
exit 1
