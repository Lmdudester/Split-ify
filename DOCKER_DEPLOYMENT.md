# Docker Deployment Guide for Split-ify

This guide explains how to deploy Split-ify using Docker with a simple clone-on-boot approach.

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

### Clone-on-Boot Design

The container uses a simple, reliable update model:

1. Container starts and runs `entrypoint.sh`
2. Clones the latest code from GitHub (shallow clone for speed)
3. Copies your mounted `.env` file for Vite build configuration
4. Installs dependencies and builds the application
5. Deploys built assets to nginx
6. Starts nginx to serve the application

**Benefits:**
- Always gets the latest code on restart
- No complex polling or state management
- Container fails cleanly if build fails
- Simple mental model: restart = update

### To Update

Simply restart the container:
```bash
docker restart splitify
```

Or use docker-compose:
```bash
docker-compose restart
```

## File Structure

```
Split-ify/
├── Dockerfile                    # Runtime container configuration
├── docker-compose.yml            # Container orchestration
├── nginx.conf                    # nginx web server config
├── .env.example                  # Environment template
├── .env                          # Your actual config (gitignored)
├── ssl/                          # SSL certificates (gitignored)
│   ├── cert.pem                  # Generated certificate
│   └── key.pem                   # Generated private key
└── scripts/
    ├── entrypoint.sh             # Container startup script
    ├── generate-ssl.ps1          # Windows SSL generation
    ├── generate-ssl.sh           # Linux/Bash SSL generation
    ├── deploy.ps1                # Windows deployment
    └── deploy.sh                 # Linux/Bash deployment
```

## Management Commands

### View Logs
```bash
# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# Watch startup progress
docker logs -f splitify
```

### Container Control
```bash
# Stop container
docker-compose down

# Restart container (triggers fresh clone and build)
docker-compose restart

# Check container status
docker-compose ps

# Check health
docker inspect --format='{{.State.Health.Status}}' splitify
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

### Build Fails on Startup

Check container logs for build errors:
```bash
docker logs splitify
```

Common issues:
- **Invalid GIT_REPO_URL**: Must be HTTPS format for public repos
- **Wrong branch name**: Check `GIT_BRANCH` in `.env`
- **Private repository**: Use HTTPS with credentials in URL
- **npm install fails**: Check for network issues or corrupted package-lock.json

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
| `GIT_BRANCH` | Git branch to clone | `main` |

**Note**: Changes to any environment variables take effect on container restart.

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
   - Monitor container restarts

5. **Backup**:
   - Container is stateless (clones fresh from git)
   - Backup `.env` file securely
   - SSL certificates regenerate easily

## Security Considerations

### Container Security

- Container runs nginx as non-root user
- Minimal attack surface (Alpine Linux base)
- No persistent state (clone fresh each boot)

### API Keys

- Stored in `.env` (gitignored)
- Mounted read-only into container
- Baked into build at compile time (Vite limitation)
- Client-side app (keys visible in browser - expected behavior)
- Use Spotify's built-in app permissions/scopes for security

### Git Access

- Public repositories use HTTPS (no credentials needed)
- Private repositories need access tokens in URL
- Credentials never logged or exposed

### SSL Certificates

- Self-signed for local development only
- Use proper CA-signed certificates for production
- Certificates in `ssl/` directory (gitignored)

## Performance

### Startup Times

- Container start to ready: ~60-90 seconds
  - Clone: ~5-10 seconds
  - npm install: ~30-45 seconds
  - Build: ~20-30 seconds
  - Deploy: ~1 second
- Health check start period: 120 seconds (allows for slow networks)

### Resource Usage

- Memory: ~50-100 MB (nginx only after startup)
- CPU: High during build, minimal when serving
- Disk: ~500 MB (built application + dependencies)
- Network: ~50-100 MB download per restart (npm packages)
