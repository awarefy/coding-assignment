#!/bin/sh

# Navigate to the directory containing this script
cd "$(dirname "$0")"

# Run the Newman tests using the official postman/newman image
echo "Running Newman tests using official postman/newman image..."
docker run --rm --network="host" -v "$(pwd)/postman_tests:/etc/newman" postman/newman:alpine run "/etc/newman/store_event_webhook.json" 