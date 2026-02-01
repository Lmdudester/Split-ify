#!/bin/bash
# Bash deployment script for Split-ify Docker container
# Automates the entire deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo -e "  Split-ify Docker Deployment Script   "
echo -e "========================================${NC}"
echo ""

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}  ✓ Docker found: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}  ✗ Docker is not installed or not running${NC}"
    echo -e "${RED}    Please install Docker from https://www.docker.com/get-started${NC}"
    exit 1
fi

# Check docker-compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}  ✓ docker-compose found: $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}  ✗ docker-compose is not installed${NC}"
    echo -e "${RED}    Please install docker-compose${NC}"
    exit 1
fi

# Step 2: Check .env file
echo -e "\n${YELLOW}[2/6] Checking environment configuration...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}  ✗ .env file not found${NC}"

    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}    Creating .env from .env.example...${NC}"
        cp ".env.example" ".env"
        echo -e "${GREEN}    ✓ Created .env file${NC}"
        echo ""
        echo -e "${YELLOW}    IMPORTANT: Please edit .env and add your API keys:${NC}"
        echo -e "${NC}      - VITE_SPOTIFY_CLIENT_ID"
        echo -e "      - VITE_REDIRECT_URI (should be https://localhost:3443/callback)"
        echo -e "      - VITE_LASTFM_API_KEY"
        echo -e "      - GIT_REPO_URL (your GitHub repository URL)"
        echo ""

        read -p "    Have you configured .env with your API keys? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}    Please configure .env and run this script again.${NC}"
            exit 0
        fi
    else
        echo -e "${RED}    .env.example not found. Cannot create .env file.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}  ✓ .env file exists${NC}"

    # Validate required variables
    REQUIRED_VARS=("VITE_SPOTIFY_CLIENT_ID" "VITE_REDIRECT_URI" "VITE_LASTFM_API_KEY" "GIT_REPO_URL")
    MISSING_VARS=()

    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=.\\+" .env; then
            MISSING_VARS+=("$var")
        fi
    done

    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo -e "${RED}  ✗ Missing or empty required variables in .env:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo -e "${RED}    - $var${NC}"
        done
        echo -e "${YELLOW}    Please configure these variables in .env and run this script again.${NC}"
        exit 1
    fi

    echo -e "${GREEN}  ✓ Required environment variables configured${NC}"
fi

# Step 3: Generate SSL certificates
echo -e "\n${YELLOW}[3/6] Checking SSL certificates...${NC}"

if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo -e "${GREEN}  ✓ SSL certificates already exist${NC}"
else
    echo -e "${YELLOW}  Generating SSL certificates...${NC}"
    bash "$SCRIPT_DIR/generate-ssl.sh"

    if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
        echo -e "${GREEN}  ✓ SSL certificates generated${NC}"
    else
        echo -e "${RED}  ✗ Failed to generate SSL certificates${NC}"
        exit 1
    fi
fi

# Step 4: Stop existing container
echo -e "\n${YELLOW}[4/6] Stopping existing containers...${NC}"

if docker-compose down 2>&1 > /dev/null; then
    echo -e "${GREEN}  ✓ Existing containers stopped${NC}"
else
    echo -e "${GREEN}  ✓ No existing containers to stop${NC}"
fi

# Step 5: Build and start container
echo -e "\n${YELLOW}[5/6] Building and starting Docker container...${NC}"
echo -e "${GRAY}  This may take a few minutes on first run...${NC}"

if docker-compose up -d --build; then
    echo -e "${GREEN}  ✓ Container built and started${NC}"
else
    echo -e "${RED}  ✗ Failed to build or start container${NC}"
    exit 1
fi

# Step 6: Wait for health check
echo -e "\n${YELLOW}[6/6] Waiting for application to be ready...${NC}"

MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' splitify 2>/dev/null || echo "starting")

    if [ "$HEALTH" = "healthy" ]; then
        echo -e "${GREEN}  ✓ Application is healthy and ready!${NC}"
        break
    elif [ "$HEALTH" = "unhealthy" ]; then
        echo -e "${RED}  ✗ Application health check failed${NC}"
        echo -e "${YELLOW}    Check logs with: docker-compose logs${NC}"
        exit 1
    else
        echo -e "${GRAY}  Waiting for health check... ($ATTEMPT/$MAX_ATTEMPTS)${NC}"
    fi

    sleep 2
done

if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo -e "${RED}  ✗ Timeout waiting for application to be ready${NC}"
    echo -e "${YELLOW}    The container may still be starting. Check with: docker-compose logs -f${NC}"
fi

# Display final status
echo -e "\n${CYAN}========================================"
echo -e "  Deployment Complete!                  "
echo -e "========================================${NC}"
echo ""
echo -e "${GREEN}Application URLs:${NC}"
echo -e "  - HTTP:  http://localhost:3000"
echo -e "  - HTTPS: https://localhost:3443"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Update Spotify Developer Dashboard:"
echo -e "${GRAY}     - Add redirect URI: https://localhost:3443/callback${NC}"
echo -e "  2. Open https://localhost:3443 in your browser"
echo -e "  3. Accept the SSL certificate warning (one-time)"
echo -e "  4. Click 'Login with Spotify' to test OAuth flow"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  - View logs:         docker-compose logs -f"
echo -e "  - Stop container:    docker-compose down"
echo -e "  - Restart:           docker-compose restart"
echo -e "  - Manual update:     bash scripts/update.sh"
echo -e "  - Check status:      docker-compose ps"
echo ""
echo -e "${CYAN}Auto-update is enabled and will check for GitHub updates every 15 minutes.${NC}"
echo ""
