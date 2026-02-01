# PowerShell deployment script for Split-ify Docker container
# Automates the entire deployment process

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Split-ify Docker Deployment Script   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Change to project root
Set-Location $projectRoot

# Step 1: Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "  ✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "    Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check docker-compose
try {
    $composeVersion = docker-compose --version
    Write-Host "  ✓ docker-compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ docker-compose is not installed" -ForegroundColor Red
    Write-Host "    Please install docker-compose or use Docker Desktop which includes it" -ForegroundColor Red
    exit 1
}

# Step 2: Check .env file
Write-Host "`n[2/6] Checking environment configuration..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    Write-Host "  ✗ .env file not found" -ForegroundColor Red

    if (Test-Path ".env.example") {
        Write-Host "    Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "    ✓ Created .env file" -ForegroundColor Green
        Write-Host ""
        Write-Host "    IMPORTANT: Please edit .env and add your API keys:" -ForegroundColor Yellow
        Write-Host "      - VITE_SPOTIFY_CLIENT_ID" -ForegroundColor White
        Write-Host "      - VITE_REDIRECT_URI (should be https://localhost:3443/callback)" -ForegroundColor White
        Write-Host "      - VITE_LASTFM_API_KEY" -ForegroundColor White
        Write-Host "      - GIT_REPO_URL (your GitHub repository URL)" -ForegroundColor White
        Write-Host ""

        $continue = Read-Host "    Have you configured .env with your API keys? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "    Please configure .env and run this script again." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "    .env.example not found. Cannot create .env file." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ .env file exists" -ForegroundColor Green

    # Validate required variables
    $envContent = Get-Content ".env" -Raw
    $requiredVars = @("VITE_SPOTIFY_CLIENT_ID", "VITE_REDIRECT_URI", "VITE_LASTFM_API_KEY", "GIT_REPO_URL")
    $missingVars = @()

    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var=.+") {
            $missingVars += $var
        }
    }

    if ($missingVars.Count -gt 0) {
        Write-Host "  ✗ Missing or empty required variables in .env:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "    - $var" -ForegroundColor Red
        }
        Write-Host "    Please configure these variables in .env and run this script again." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "  ✓ Required environment variables configured" -ForegroundColor Green
}

# Step 3: Generate SSL certificates
Write-Host "`n[3/6] Checking SSL certificates..." -ForegroundColor Yellow

if ((Test-Path "ssl\cert.pem") -and (Test-Path "ssl\key.pem")) {
    Write-Host "  ✓ SSL certificates already exist" -ForegroundColor Green
} else {
    Write-Host "  Generating SSL certificates..." -ForegroundColor Yellow
    & "$scriptDir\generate-ssl.ps1"

    if ((Test-Path "ssl\cert.pem") -and (Test-Path "ssl\key.pem")) {
        Write-Host "  ✓ SSL certificates generated" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to generate SSL certificates" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Stop existing container
Write-Host "`n[4/6] Stopping existing containers..." -ForegroundColor Yellow

try {
    docker-compose down 2>&1 | Out-Null
    Write-Host "  ✓ Existing containers stopped" -ForegroundColor Green
} catch {
    Write-Host "  ✓ No existing containers to stop" -ForegroundColor Green
}

# Step 5: Build and start container
Write-Host "`n[5/6] Building and starting Docker container..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes on first run..." -ForegroundColor Gray

try {
    docker-compose up -d --build
    Write-Host "  ✓ Container built and started" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to build or start container" -ForegroundColor Red
    Write-Host "    Error: $_" -ForegroundColor Red
    exit 1
}

# Step 6: Wait for health check
Write-Host "`n[6/6] Waiting for application to be ready..." -ForegroundColor Yellow

$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++

    try {
        $health = docker inspect --format='{{.State.Health.Status}}' splitify 2>$null

        if ($health -eq "healthy") {
            Write-Host "  ✓ Application is healthy and ready!" -ForegroundColor Green
            break
        } elseif ($health -eq "unhealthy") {
            Write-Host "  ✗ Application health check failed" -ForegroundColor Red
            Write-Host "    Check logs with: docker-compose logs" -ForegroundColor Yellow
            exit 1
        } else {
            Write-Host "  Waiting for health check... ($attempt/$maxAttempts)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  Waiting for container to start... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }

    Start-Sleep -Seconds 2
}

if ($attempt -ge $maxAttempts) {
    Write-Host "  ✗ Timeout waiting for application to be ready" -ForegroundColor Red
    Write-Host "    The container may still be starting. Check with: docker-compose logs -f" -ForegroundColor Yellow
}

# Display final status
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!                  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Green
Write-Host "  - HTTP:  http://localhost:3000" -ForegroundColor White
Write-Host "  - HTTPS: https://localhost:3443" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update Spotify Developer Dashboard:" -ForegroundColor White
Write-Host "     - Add redirect URI: https://localhost:3443/callback" -ForegroundColor Gray
Write-Host "  2. Open https://localhost:3443 in your browser" -ForegroundColor White
Write-Host "  3. Accept the SSL certificate warning (one-time)" -ForegroundColor White
Write-Host "  4. Click ``Login with Spotify`` to test OAuth flow" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  - View logs:         docker-compose logs -f" -ForegroundColor White
Write-Host "  - Stop container:    docker-compose down" -ForegroundColor White
Write-Host "  - Restart:           docker-compose restart" -ForegroundColor White
Write-Host "  - Manual update:     bash scripts/update.sh" -ForegroundColor White
Write-Host "  - Check status:      docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "Auto-update is enabled and will check for GitHub updates every 15 minutes." -ForegroundColor Cyan
Write-Host ""
