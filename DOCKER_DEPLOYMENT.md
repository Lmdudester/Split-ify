# Docker Deployment Guide for Split-ify

This guide explains how to deploy Split-ify using Docker with automatic GitHub updates.

## Quick Start

### 1. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env with your values
```

Required variables in `.env`:
- `VITE_SPOTIFY_CLIENT_ID` - From Spotify Developer Dashboard
- `VITE_REDIRECT_URI` - Must be `https://localhost:3443/callback`
- `VITE_LASTFM_API_KEY` - From Last.fm API account
- `GIT_REPO_URL` - Your GitHub repository URL (HTTPS format)
- `GIT_BRANCH` - Branch to track (default: `main`)
- `UPDATE_CHECK_INTERVAL` - Seconds between update checks (default: `900` = 15 minutes)

### 2. Update Spotify Redirect URI

Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):
1. Open your app's settings
2. Add redirect URI: `https://localhost:3443/callback`
3. Save changes

### 3. Deploy

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1
```

**Linux/macOS/Git Bash:**
```bash
bash scripts/deploy.sh
```

The deployment script automatically:
- ✓ Validates Docker and docker-compose installation
- ✓ Checks `.env` configuration
- ✓ Generates SSL certificates if needed
- ✓ Builds the Docker container
- ✓ Starts the application
- ✓ Waits for health checks
- ✓ Displays access URLs

### 4. Access Application

- **HTTPS (recommended)**: `https://localhost:3443`
- **HTTP**: `http://localhost:3000`

**First-time SSL warning**: Your browser will show a security warning because the certificate is self-signed. Click "Advanced" → "Proceed to localhost" (safe for local development).

## Architecture

### Multi-Stage Docker Build

1. **Dependencies Stage**: Install production dependencies
2. **Builder Stage**: Build Vite application with environment variables
3. **Production Stage**: nginx serves static files + auto-update script runs in background

### Auto-Update System

The container automatically:
- Polls GitHub repository every 15 minutes (configurable)
- Detects new commits by comparing HEAD
- On update: pulls changes → installs deps → builds app → deploys → reloads nginx
- Logs all activity with timestamps

**No downtime**: nginx continues serving old version during rebuild.

## File Structure

```
Split-ify/
├── Dockerfile                    # Multi-stage build configuration
├── docker-compose.yml            # Container orchestration
├── nginx.conf                    # nginx web server config
├── .env.example                  # Environment template
├── .env                          # Your actual config (gitignored)
├── ssl/                          # SSL certificates (gitignored)
│   ├── cert.pem                  # Generated certificate
│   └── key.pem                   # Generated private key
└── scripts/
    ├── auto-update.sh            # Background update polling
    ├── generate-ssl.ps1          # Windows SSL generation
    ├── generate-ssl.sh           # Linux/Bash SSL generation
    ├── deploy.ps1                # Windows deployment
    ├── deploy.sh                 # Linux/Bash deployment
    └── update.sh                 # Manual update trigger
```

## Management Commands

### View Logs
```bash
# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View only auto-update logs
docker-compose logs -f | grep AUTO-UPDATE
```

### Container Control
```bash
# Stop container
docker-compose down

# Restart container
docker-compose restart

# Check container status
docker-compose ps

# Check health
docker inspect --format='{{.State.Health.Status}}' splitify
```

### Updates
```bash
# Trigger manual update (without waiting for polling interval)
bash scripts/update.sh

# View update logs
docker-compose logs -f | grep UPDATE

# Change update interval (edit .env, then restart)
UPDATE_CHECK_INTERVAL=300  # 5 minutes
docker-compose restart
```

### Rebuild from Scratch
```bash
# Stop and remove container
docker-compose down

# Rebuild with latest changes
docker-compose up -d --build

# Or use deployment script
bash scripts/deploy.sh
```

## SSL Certificates

### Generate New Certificates

**Windows (PowerShell):**
```powershell
.\scripts\generate-ssl.ps1
```

**Linux/Git Bash:**
```bash
bash scripts/generate-ssl.sh
```

Certificates are valid for 365 days.

### Trust Certificate (Optional)

To avoid browser warnings:

**Windows:**
1. Double-click `ssl/cert.pem`
2. Click "Install Certificate..."
3. Select "Current User"
4. Choose "Place all certificates in the following store"
5. Browse to "Trusted Root Certification Authorities"
6. Complete the wizard

**macOS:**
1. Open Keychain Access
2. File → Import Items → Select `ssl/cert.pem`
3. Find certificate in list → Right-click → Get Info
4. Expand "Trust" → Set "When using this certificate" to "Always Trust"

**Linux:**
```bash
# Ubuntu/Debian
sudo cp ssl/cert.pem /usr/local/share/ca-certificates/splitify.crt
sudo update-ca-certificates

# Arch
sudo trust anchor ssl/cert.pem
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker-compose logs
```

Common issues:
- **Port already in use**: Another service is using port 3000 or 3443
  - Solution: Stop the other service or change ports in `docker-compose.yml`
- **Missing .env**: Create `.env` from `.env.example`
- **Missing SSL certificates**: Run `./scripts/generate-ssl.ps1` or `bash scripts/generate-ssl.sh`

### Auto-Update Not Working

Check update logs:
```bash
docker-compose logs -f | grep AUTO-UPDATE
```

Common issues:
- **Invalid GIT_REPO_URL**: Must be HTTPS format for public repos
- **Wrong branch name**: Check `GIT_BRANCH` in `.env`
- **Private repository**: Add SSH key or use HTTPS with credentials

### OAuth Flow Fails

1. **Check Spotify redirect URI**: Must be exactly `https://localhost:3443/callback`
2. **Check certificate**: Browser must accept SSL certificate
3. **Check environment**: Verify `VITE_REDIRECT_URI` in `.env` matches

### Health Check Fails

```bash
# Check nginx is running
docker exec splitify nginx -t

# Check health endpoint
curl -k https://localhost:3443/health
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SPOTIFY_CLIENT_ID` | Spotify app client ID | `abc123...` |
| `VITE_REDIRECT_URI` | OAuth callback URL | `https://localhost:3443/callback` |
| `VITE_LASTFM_API_KEY` | Last.fm API key | `xyz789...` |
| `GIT_REPO_URL` | GitHub repository URL | `https://github.com/user/repo.git` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GIT_BRANCH` | Git branch to track | `main` |
| `UPDATE_CHECK_INTERVAL` | Update check interval (seconds) | `900` (15 min) |

**Note**: Changes to Vite environment variables require container rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

## Production Deployment

For production deployment:

1. **Use proper domain and SSL**:
   - Replace self-signed certificate with Let's Encrypt or commercial cert
   - Update `VITE_REDIRECT_URI` to match your domain
   - Update Spotify Developer Dashboard with production redirect URI

2. **Secure environment variables**:
   - Use secrets management (Docker secrets, Kubernetes secrets, etc.)
   - Never commit `.env` to git

3. **Configure reverse proxy** (optional):
   - Use nginx/Caddy/Traefik as reverse proxy
   - Handle SSL termination at proxy level
   - Forward to container on port 3000 (HTTP)

4. **Monitor and logs**:
   - Set up log aggregation (ELK, Loki, etc.)
   - Configure health check monitoring
   - Set up alerts for failed updates

5. **Backup**:
   - Container is stateless (rebuilds from git)
   - Backup `.env` file securely
   - SSL certificates regenerate easily

## Security Considerations

### Container Security

- Container runs nginx as non-root user
- Multi-stage build excludes dev dependencies
- Minimal attack surface (Alpine Linux base)

### API Keys

- Stored in `.env` (gitignored)
- Baked into build at compile time (Vite limitation)
- Client-side app (keys visible in browser - expected behavior)
- Use Spotify's built-in app permissions/scopes for security

### Git Access

- Public repositories use HTTPS (no credentials needed)
- Private repositories need SSH keys or access tokens
- Credentials never logged or exposed

### SSL Certificates

- Self-signed for local development only
- Use proper CA-signed certificates for production
- Certificates in `ssl/` directory (gitignored)

## Performance

### Build Times

- First build: ~2-3 minutes (depends on dependencies)
- Subsequent builds: ~1-2 minutes (Docker layer caching)
- Update rebuild: ~2-3 minutes (triggered by auto-update)

### Resource Usage

- Memory: ~50-100 MB (nginx + Node.js for updates)
- CPU: Minimal (idle), ~100% during rebuild
- Disk: ~500 MB (built application + dependencies)

### Auto-Update Impact

- Update check: ~1 second (git fetch)
- Rebuild: ~2-3 minutes (only if new commits detected)
- Zero-downtime: Old version serves during rebuild
- Nginx reload: <1 second (graceful)

## Changelog

### Version 1.0.0
- Initial Docker deployment
- Auto-update from GitHub
- SSL certificate generation
- Automated deployment scripts
- Health checks and monitoring
- Windows and Linux support
