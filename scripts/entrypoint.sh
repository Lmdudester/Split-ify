#!/bin/bash
set -e  # Exit on any error

# Clean up any previous source directory
if [ -d /app/src ]; then
    echo "[STARTUP] Cleaning up previous source..."
    # Remove write protection on node_modules/.cache and other protected files
    chmod -R u+rwX /app/src 2>/dev/null || true
    rm -rf /app/src
fi

echo "[STARTUP] Cloning repository..."
git clone --depth 1 --branch "${GIT_BRANCH:-main}" "${GIT_REPO_URL}" /app/src

# Copy mounted .env file into source directory for Vite build
if [ -f /app/config/.env ]; then
    echo "[STARTUP] Copying .env configuration..."
    cp /app/config/.env /app/src/.env
fi

echo "[STARTUP] Installing dependencies..."
cd /app/src
npm ci --ignore-scripts

echo "[STARTUP] Building application..."
npm run build

echo "[STARTUP] Deploying to nginx..."
rm -rf /usr/share/nginx/html/*
cp -r /app/src/dist/* /usr/share/nginx/html/

echo "[STARTUP] Starting nginx..."
exec nginx -g 'daemon off;'
