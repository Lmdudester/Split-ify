FROM nginx:alpine

# Install runtime dependencies
RUN apk add --no-cache git nodejs npm bash

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint and fix line endings
COPY scripts/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

# Health check (120s start period for clone + build)
HEALTHCHECK --interval=30s --timeout=3s --start-period=120s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

EXPOSE 80 443
ENTRYPOINT ["/entrypoint.sh"]
