#!/bin/sh
set -e

echo "Running OrangeHRM Test Suite in Docker..."

if [ "$RUN_MODE" = "smoke" ]; then
  npm run test:smoke
elif [ "$RUN_MODE" = "api" ]; then
  npm run test:api
elif [ "$RUN_MODE" = "all" ]; then
  npm test
else
  npm test
fi

# Generate reports if requested
if [ "$GENERATE_REPORTS" = "true" ]; then
  npm run test:report
fi
