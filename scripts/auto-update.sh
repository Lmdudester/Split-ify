#!/bin/bash
# Auto-update script for Split-ify Docker container
# Polls GitHub repository and rebuilds on new commits

set -e

echo "[AUTO-UPDATE] Starting auto-update service..."
echo "[AUTO-UPDATE] Repository: ${GIT_REPO_URL}"
echo "[AUTO-UPDATE] Branch: ${GIT_BRANCH:-main}"
echo "[AUTO-UPDATE] Check interval: ${UPDATE_CHECK_INTERVAL:-900} seconds"

# Initialize git repository if not already done
if ! git -C /app rev-parse --git-dir > /dev/null 2>&1; then
    echo "[AUTO-UPDATE] Initializing git repository..."
    cd /app
    git init
    git remote add origin "${GIT_REPO_URL}"
    git fetch origin
    git checkout -b "${GIT_BRANCH:-main}" "origin/${GIT_BRANCH:-main}"
    echo "[AUTO-UPDATE] Repository initialized"
fi

# Main update loop
while true; do
    sleep "${UPDATE_CHECK_INTERVAL:-900}"

    echo "[AUTO-UPDATE] $(date '+%Y-%m-%d %H:%M:%S') - Checking for updates..."

    cd /app

    # Fetch latest changes
    git fetch origin "${GIT_BRANCH:-main}" 2>&1 | grep -v "Warning: Permanently added" || true

    # Get current and remote HEAD
    LOCAL_HEAD=$(git rev-parse HEAD)
    REMOTE_HEAD=$(git rev-parse "origin/${GIT_BRANCH:-main}")

    if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
        echo "[AUTO-UPDATE] New commit detected: $REMOTE_HEAD"
        echo "[AUTO-UPDATE] Pulling changes..."

        # Pull changes
        git pull origin "${GIT_BRANCH:-main}"

        echo "[AUTO-UPDATE] Installing dependencies..."
        npm ci --ignore-scripts

        echo "[AUTO-UPDATE] Building application..."
        npm run build

        echo "[AUTO-UPDATE] Deploying new version..."
        rm -rf /usr/share/nginx/html/*
        cp -r /app/dist/* /usr/share/nginx/html/

        echo "[AUTO-UPDATE] Reloading nginx..."
        nginx -s reload

        echo "[AUTO-UPDATE] Update complete! Version: $REMOTE_HEAD"
    else
        echo "[AUTO-UPDATE] No updates available"
    fi
done
