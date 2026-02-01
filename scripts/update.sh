#!/bin/bash
# Manual update script for Split-ify Docker container
# Triggers an immediate update without waiting for the auto-update interval

set -e

echo "Triggering manual update for Split-ify..."

# Check if container is running
if ! docker ps | grep -q splitify; then
    echo "Error: Split-ify container is not running"
    echo "Start it with: docker-compose up -d"
    exit 1
fi

echo "Executing update inside container..."

# Execute update commands inside the container
docker exec splitify /bin/bash -c '
    set -e
    cd /app

    echo "[UPDATE] Fetching latest changes from GitHub..."
    git fetch origin "${GIT_BRANCH:-main}"

    LOCAL_HEAD=$(git rev-parse HEAD)
    REMOTE_HEAD=$(git rev-parse "origin/${GIT_BRANCH:-main}")

    if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
        echo "[UPDATE] Already up to date (commit: $LOCAL_HEAD)"
        exit 0
    fi

    echo "[UPDATE] New commit detected: $REMOTE_HEAD"
    echo "[UPDATE] Current commit: $LOCAL_HEAD"

    echo "[UPDATE] Pulling changes..."
    git pull origin "${GIT_BRANCH:-main}"

    echo "[UPDATE] Installing dependencies..."
    npm ci --ignore-scripts

    echo "[UPDATE] Building application..."
    npm run build

    echo "[UPDATE] Deploying new version..."
    rm -rf /usr/share/nginx/html/*
    cp -r /app/dist/* /usr/share/nginx/html/

    echo "[UPDATE] Reloading nginx..."
    nginx -s reload

    echo "[UPDATE] Update complete! New version: $REMOTE_HEAD"
'

echo ""
echo "Manual update completed successfully!"
echo "Access the updated application at:"
echo "  - HTTP:  http://localhost:3000"
echo "  - HTTPS: https://localhost:3443"
