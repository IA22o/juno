# GitHub Actions Deployment Configuration

## Overview

This document describes the process of configuring GitHub Actions to automatically deploy a Next.js application to a remote server via SSH, building the Docker container on the remote host.

## Architecture

```
GitHub Repository
    ↓
git push to main
    ↓
GitHub Actions Workflow
    ↓
SSH Connection (Deploy Key)
    ↓
Remote Server
    ├─ git pull origin main
    ├─ docker compose up --build -d
    └─ Application Deployed (Nginx ← Docker Container)
```

## Implementation Steps

### 1. Generate SSH Deploy Key

Generate an Ed25519 SSH key pair for GitHub Actions authentication:

```bash
ssh-keygen -t ed25519 -f /path/to/deploy_key -N "" -C "github-actions"
```

This produces:
- **Private key** (`deploy_key`): Stored as GitHub secret
- **Public key** (`deploy_key.pub`): Added to remote server's `authorized_keys`

### 2. Configure Remote Server SSH Access

Add the public key to the remote server:

```bash
ssh remote_user@remote_host "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys" << 'EOF'
<public_key_content>
EOF
```

Verify SSH connection works without password:

```bash
ssh -i /path/to/deploy_key remote_user@remote_host "echo 'SSH Works'"
```

### 3. Initialize Git Repository on Remote Server

The deployment directory must be a git repository:

```bash
ssh remote_user@remote_host "cd /path/to/deployment && git init && git remote add origin <repo_url> && git fetch origin <branch> && git checkout <branch>"
```

This ensures the remote server can pull latest code during deployment.

### 4. Create Docker Build Files on Remote Server

Since Docker files are deployment-specific (not tracked in git), create them manually on the remote:

**Dockerfile** - Multi-stage build optimized for production:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY types ./types
COPY marketing ./marketing
COPY next.config.js ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
ARG PERPLEXITY_API_KEY
ENV PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
```

**docker-compose.yml** - Service configuration:

```yaml
services:
  app_service:
    build:
      context: ./
      dockerfile: ./Dockerfile
      args:
        BUILD_SECRET_VAR: ${BUILD_SECRET_VAR}
    container_name: app_container
    restart: unless-stopped
    environment:
      - BUILD_SECRET_VAR=${BUILD_SECRET_VAR}
      - NODE_ENV=production
    networks:
      - reverse_proxy_network
    expose:
      - "3000"

networks:
  reverse_proxy_network:
    external: true
```

**Environment file** (`.env`) - Persisted on remote:

```bash
BUILD_SECRET_VAR=<secret_value>
```

### 5. Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml` in the repository:

```yaml
name: Deploy to Remote Server

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to remote server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd <deployment_path>
            git fetch origin
            git checkout <branch>
            git pull origin <branch>
            docker compose up --build -d
            echo "✅ Deployment completed"
```

Commit and push the workflow file to the repository.

### 6. Add GitHub Secrets

Configure three secrets in GitHub repository settings (`Settings → Secrets and variables → Actions`):

| Secret Name | Value |
|---|---|
| `DEPLOY_HOST` | Remote server IP/hostname |
| `DEPLOY_USER` | Remote server username (usually `root`) |
| `DEPLOY_KEY` | Private SSH key (entire file content) |

### 7. Verify Setup

Test the complete workflow:

1. **Manual SSH verification**:
   ```bash
   ssh -i /path/to/deploy_key <user>@<host> "cd <path> && git log --oneline -1"
   ```

2. **Workflow trigger**: 
   - Push to `main` branch or merge a PR
   - Monitor GitHub Actions: `https://github.com/<org>/<repo>/actions`

3. **Deployment verification**:
   ```bash
   ssh <user>@<host> "docker ps"
   curl -I https://<domain>/
   ```

## Key Considerations

### Build Context

- **Context path**: Root directory (`./`)
- **Dockerfile location**: Root or subdirectory (specify in `docker-compose.yml`)
- Ensures all source files (app/, components/, lib/, etc.) are accessible during build

### Security

- **SSH Key**: Ed25519 for modern cryptography
- **No password**: Deploy key enables passwordless authentication
- **Secrets**: GitHub secrets keep credentials out of version control
- **Build Args**: API keys passed only at build time via `docker compose` args

### Environment Management

- **Build-time variables**: Passed via Docker `ARG` and injected from `.env`
- **Runtime variables**: Set in `docker-compose.yml`
- **Persistence**: `.env` file on remote server is not modified during deployment, preserving secrets

### Production Considerations

- **Multi-stage builds**: Reduces final image size, excludes build dependencies
- **Non-root user**: Container runs as unprivileged user (`nextjs`)
- **Restart policy**: `unless-stopped` ensures container restarts on server reboot
- **External network**: Connects to existing reverse proxy network (Nginx)
- **Type checking**: TypeScript validation during build catches errors early

## Deployment Flow

1. **Trigger**: `git push origin main` or PR merge
2. **GitHub Actions**: Workflow activates
3. **SSH Connection**: Uses deploy key for authentication
4. **Code Update**: `git fetch` and `git checkout` pull latest code
5. **Build**: `docker compose up --build` triggers multi-stage build
6. **Inject Secrets**: Build args pass API keys from `.env`
7. **Run**: New container starts on port 3000
8. **Routing**: Reverse proxy (Nginx) routes traffic to container
9. **Complete**: Application live with latest code

## Cleanup and Maintenance

### View logs:
```bash
ssh <user>@<host> "docker logs -f <container_name>"
```

### Manual rebuild:
```bash
ssh <user>@<host> "cd <path> && docker compose up --build -d"
```

### Rollback to previous version:
```bash
ssh <user>@<host> "cd <path> && git checkout <commit_hash> && docker compose up --build -d"
```

### Remove old images:
```bash
ssh <user>@<host> "docker image prune -f"
```

## Testing the Workflow

To verify the workflow is functioning:

1. Make a test change to a file
2. Push to `main` branch
3. Go to `https://github.com/<org>/<repo>/actions`
4. Click the latest workflow run
5. Verify build and deployment steps completed successfully
6. Check remote server: `docker ps` and verify container is running

## Troubleshooting

| Issue | Solution |
|---|---|
| SSH connection fails | Verify deploy key in GitHub secrets, check `authorized_keys` on remote |
| Build fails | Check `docker compose logs`, verify Dockerfile paths |
| Old code running | Verify `git pull` succeeded, check latest commit on remote |
| Type check errors | Review TypeScript compilation errors in build logs |
| Port conflicts | Ensure `docker-compose.yml` exposes correct port to external network |

## References

- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- [GitHub Actions: Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Compose: Build](https://docs.docker.com/compose/compose-file/03-compose-file-build/)
- [Next.js: Deployment](https://nextjs.org/docs/deployment)
