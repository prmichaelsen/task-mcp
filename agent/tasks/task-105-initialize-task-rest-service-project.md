# Task 105: Initialize task-rest-service Project

**Milestone**: Milestone 4 - REST API Service
**Estimated Time**: 2 hours
**Dependencies**: Task 98 (Publish task-core to npm)
**Status**: Not Started

---

## Objective

Initialize the `task-rest-service` project with Express, TypeScript, build configuration, testing infrastructure, and ACP documentation structure for Cloud Run deployment.

## Steps

### 1. Create Project Directory

```bash
mkdir -p task-rest-service
cd task-rest-service
```

### 2. Initialize npm Package

```bash
npm init -y
```

Update `package.json`:
```json
{
  "name": "task-rest-service",
  "version": "1.0.0",
  "description": "REST API service for task execution system (Cloud Run)",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "build": "node esbuild.build.js",
    "build:watch": "node esbuild.watch.js",
    "clean": "rm -rf dist",
    "dev": "npm run build:watch",
    "start": "node dist/server.js",
    "test": "jest",
    "test:unit": "jest --testMatch='**/*.spec.ts'",
    "test:e2e": "jest --testMatch='**/*.e2e.ts'",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [
    "rest-api",
    "task-execution",
    "cloud-run",
    "express"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@prmichaelsen/task-core": "^1.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "firebase-admin": "^13.6.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jest": "^29.5.14",
    "@types/node": "^25.2.3",
    "@types/supertest": "^6.0.2",
    "esbuild": "^0.27.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.4.6",
    "typescript": "^5.9.3"
  }
}
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create TypeScript Configuration

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.e2e.ts"]
}
```

### 5. Create Jest Configuration

Create `jest.config.js`:
```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2022',
          moduleResolution: 'node'
        }
      }
    ]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e.ts',
    '!src/server.ts'
  ],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.spec.ts',
    '**/*.e2e.ts'
  ]
}
```

### 6. Create esbuild Configuration

Create `esbuild.build.js`:
```javascript
import esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  outfile: 'dist/server.js',
  external: [
    '@prmichaelsen/task-core',
    'firebase-admin'
  ]
})

console.log('Build complete!')
```

Create `esbuild.watch.js`:
```javascript
import esbuild from 'esbuild'

const ctx = await esbuild.context({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  outfile: 'dist/server.js',
  external: [
    '@prmichaelsen/task-core',
    'firebase-admin'
  ]
})

await ctx.watch()
console.log('Watching for changes...')
```

### 7. Create Directory Structure

```bash
mkdir -p src/{routes,middleware,utils}
mkdir -p __tests__/{routes,middleware,integration}
mkdir -p agent/{design,milestones,tasks,patterns}
```

### 8. Create Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/server.js"]
```

### 9. Create .dockerignore

Create `.dockerignore`:
```
node_modules
dist
coverage
.git
.gitignore
.env
.env.local
*.md
__tests__
*.spec.ts
*.e2e.ts
agent/
```

### 10. Create Cloud Build Configuration

Create `cloudbuild.yaml`:
```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/task-rest-service:$COMMIT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/task-rest-service:latest'
      - '.'

  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/task-rest-service:$COMMIT_SHA'

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'task-rest-service'
      - '--image'
      - 'gcr.io/$PROJECT_ID/task-rest-service:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'NODE_ENV=production'
      - '--set-secrets'
      - 'FIREBASE_SERVICE_ACCOUNT_JSON=firebase-service-account:latest'

images:
  - 'gcr.io/$PROJECT_ID/task-rest-service:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/task-rest-service:latest'

options:
  machineType: 'N1_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY
```

### 11. Create .gitignore

Create `.gitignore`:
```
# Dependencies
node_modules/

# Build output
dist/

# Test coverage
coverage/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Firebase
firestore-debug.log
firebase-debug.log
firebase-service-account.json
```

### 12. Create Environment Template

Create `.env.example`:
```bash
# Server Configuration
PORT=8080
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 13. Create README.md

Create `README.md`:
```markdown
# task-rest-service

REST API service for task execution system. Provides HTTP endpoints for task management, deployed on Google Cloud Run.

## Features

- RESTful API for task CRUD operations
- Milestone and task item management
- Message management
- Firebase Authentication
- Auto-scaling on Cloud Run
- Health check endpoint

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## Deployment

### Prerequisites

- Google Cloud Project
- Firebase project with Firestore
- Service account with Firestore access

### Deploy to Cloud Run

\`\`\`bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml

# Or use Docker
docker build -t task-rest-service .
docker run -p 8080:8080 --env-file .env task-rest-service
\`\`\`

## API Endpoints

### Tasks
- \`POST /api/tasks\` - Create task
- \`GET /api/tasks\` - List tasks
- \`GET /api/tasks/:id\` - Get task
- \`PATCH /api/tasks/:id\` - Update task
- \`DELETE /api/tasks/:id\` - Delete task

### Milestones
- \`POST /api/tasks/:id/milestones\` - Create milestone
- \`PATCH /api/tasks/:id/milestones/:milestoneId\` - Update milestone

### Messages
- \`GET /api/tasks/:id/messages\` - Get messages
- \`POST /api/tasks/:id/messages\` - Add message

### Health
- \`GET /health\` - Health check

## License

MIT
```

### 14. Create CHANGELOG.md

Create `CHANGELOG.md`:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.0.0] - 2026-02-18

### Added
- Initial release of task-rest-service
- REST API endpoints for task management
- Firebase Authentication middleware
- Cloud Run deployment configuration
- Health check endpoint

[Unreleased]: https://github.com/yourusername/task-rest-service/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/task-rest-service/releases/tag/v1.0.0
```

### 15. Initialize ACP Structure

Copy ACP files:
```bash
# Copy AGENT.md
cp ../task-mcp/AGENT.md ./AGENT.md

# Copy agent structure
cp -r ../task-mcp/agent/patterns ./agent/
cp -r ../task-mcp/agent/commands ./agent/

# Create initial progress.yaml
cat > agent/progress.yaml << 'EOF'
project:
  name: task-rest-service
  version: 1.0.0
  started: 2026-02-18
  status: in_progress
  current_milestone: M1
  description: |
    REST API service for task execution system.
    Deployed on Google Cloud Run for auto-scaling.

milestones:
  - id: M1
    name: REST API Service
    status: in_progress
    progress: 5
    started: 2026-02-18
    completed: null
    estimated_weeks: 1
    tasks_completed: 1
    tasks_total: 15

tasks:
  milestone_1:
    - id: task-105
      name: Initialize task-rest-service Project
      status: in_progress
      file: agent/tasks/task-105-initialize-task-rest-service-project.md
      estimated_hours: 2
      completed_date: null

documentation:
  design_documents: 0
  milestone_documents: 1
  pattern_documents: 1
  task_documents: 1

progress:
  planning: 100
  implementation: 5
  testing: 0
  documentation: 50
  overall: 5

recent_work:
  - date: 2026-02-18
    description: Started Task 105 - Initialize task-rest-service project
    items:
      - 📋 Created project structure
      - 📋 Configured Express and TypeScript
      - 📋 Set up Cloud Run deployment

next_steps:
  - Complete Task 105: Initialize project
  - Start Task 106: Implement Task CRUD routes

notes:
  - Uses @prmichaelsen/task-core v1.0.0
  - Deploys to Google Cloud Run
  - Auto-scales from 0 to 100 instances

current_blockers: []
EOF
```

### 16. Initialize Git Repository

```bash
git init
git add .
git commit -m "chore: initialize task-rest-service project"
```

---

## Verification

- [ ] `package.json` created with correct dependencies
- [ ] All dependencies installed successfully
- [ ] TypeScript configuration compiles without errors
- [ ] Jest configuration loads correctly
- [ ] esbuild configuration exists
- [ ] Dockerfile builds successfully (test with `docker build -t test .`)
- [ ] Cloud Build configuration valid
- [ ] Directory structure created
- [ ] `.gitignore` excludes sensitive files
- [ ] `.env.example` documents required variables
- [ ] `README.md` documents API endpoints
- [ ] `CHANGELOG.md` initialized
- [ ] ACP structure copied
- [ ] Git repository initialized

---

## Expected Output

### Files Created
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest configuration
- `esbuild.build.js` - Build script
- `esbuild.watch.js` - Watch script
- `Dockerfile` - Container image
- `cloudbuild.yaml` - Cloud Build config
- `.dockerignore` - Docker ignore rules
- `.gitignore` - Git ignore rules
- `.env.example` - Environment template
- `README.md` - Documentation
- `CHANGELOG.md` - Version history
- `agent/progress.yaml` - Progress tracking

### Console Output
```
✓ npm install completed
✓ TypeScript configuration valid
✓ Jest configuration valid
✓ Dockerfile syntax valid
✓ Directory structure created
✓ Git repository initialized
```

---

## Next Task

[Task 106: Implement Task CRUD Routes](task-106-implement-task-crud-routes.md)

---

**Status**: Not Started
**Estimated Time**: 2 hours
**Priority**: High
**Owner**: Development Team
**Created**: 2026-02-18
