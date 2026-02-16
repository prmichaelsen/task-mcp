# Task 92: Deployment Configuration

**Milestone**: Milestone 2 - MCP Server Foundation
**Estimated Time**: 4 hours
**Dependencies**: Task 91 (Build Configuration)
**Status**: Not Started

---

## Objective

Create deployment configuration for running task-mcp MCP server on Cloud Run or other platforms. Set up environment variables, service account configuration, and deployment scripts.

## Steps

### 1. Create Environment Configuration

Create `.env.example`:
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
# Or use JSON directly:
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Server Configuration
NODE_ENV=production
LOG_LEVEL=info
```

### 2. Create Dockerfile

Create `Dockerfile`:
- Use Node.js 20 base image
- Copy package files and install dependencies
- Copy source code
- Build the project
- Set up entrypoint for server
- Expose necessary ports (if using SSE)

### 3. Create Cloud Run Configuration

Create `cloudrun.yaml`:
- Service name: task-mcp
- Region: us-central1
- Memory: 512Mi
- CPU: 1
- Min instances: 0
- Max instances: 10
- Environment variables
- Service account

### 4. Create Deployment Script

Create `scripts/deploy.sh`:
- Build Docker image
- Push to Google Container Registry
- Deploy to Cloud Run
- Set environment variables
- Configure service account

### 5. Update .gitignore

Add to `.gitignore`:
- `service-account.json`
- `.env`
- `.env.local`
- `dist/`
- `coverage/`

### 6. Create README

Create `README.md`:
- Project description
- Installation instructions
- Configuration guide
- Deployment guide
- Usage examples

## Verification

- [ ] .env.example created
- [ ] Dockerfile builds successfully
- [ ] Cloud Run configuration valid
- [ ] Deployment script works
- [ ] .gitignore updated
- [ ] README.md complete
- [ ] Service account not in git
- [ ] Environment variables documented

## Example Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Run the server
CMD ["node", "dist/server.js"]
```

## Files to Create

- `Dockerfile`
- `.env.example`
- `cloudrun.yaml`
- `scripts/deploy.sh`
- `README.md`
- Update `.gitignore`

---

**Next Task**: Milestone 2 Complete! → [Milestone 3: agentbase.me Integration](../milestones/milestone-3-agentbase-integration.md)
