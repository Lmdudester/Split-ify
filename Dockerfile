# Multi-stage Docker build for Split-ify React/Vite SPA

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# Build args for environment variables (passed from docker-compose)
ARG VITE_SPOTIFY_CLIENT_ID
ARG VITE_REDIRECT_URI
ARG VITE_LASTFM_API_KEY
ENV VITE_SPOTIFY_CLIENT_ID=${VITE_SPOTIFY_CLIENT_ID}
ENV VITE_REDIRECT_URI=${VITE_REDIRECT_URI}
ENV VITE_LASTFM_API_KEY=${VITE_LASTFM_API_KEY}
RUN npm run build

# Stage 3: Production server with auto-update capability
FROM nginx:alpine
WORKDIR /app

# Install git, nodejs, npm for auto-update functionality
RUN apk add --no-cache git nodejs npm bash

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy package files for rebuild capability
COPY package.json package-lock.json ./

# Copy auto-update script and fix line endings
COPY scripts/auto-update.sh /app/auto-update.sh
RUN sed -i 's/\r$//' /app/auto-update.sh && chmod +x /app/auto-update.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Start nginx and auto-update script in background
# Fix line endings at runtime (workaround for Windows CRLF issue)
CMD ["/bin/sh", "-c", "sed -i 's/\\r$//' /app/auto-update.sh && bash /app/auto-update.sh & nginx -g 'daemon off;'"]
