# Milestone 4: REST API Service

**Goal**: Create `task-rest-service` for Cloud Run deployment with REST API endpoints
**Duration**: 1 week
**Dependencies**: Milestone 3 (Core Library Extraction)
**Status**: Not Started

---

## Overview

This milestone creates a new `task-rest-service` project that provides REST API endpoints for task management. The service uses `@prmichaelsen/task-core` for business logic and deploys to Google Cloud Run for auto-scaling and serverless execution.

## Deliverables

1. **REST API Service**
   - Express/Fastify server with TypeScript
   - Complete REST API for task management
   - Authentication middleware (Firebase Auth)
   - Validation middleware (Zod schemas)
   - Error handling and logging

2. **API Endpoints**
   - Task CRUD operations
   - Milestone management
   - Task item management
   - Message management
   - Health check endpoint

3. **Cloud Run Deployment**
   - Dockerfile for containerization
   - Cloud Build configuration
   - Service account setup
   - Environment variable configuration
   - Auto-scaling configuration

4. **Testing and Documentation**
   - Unit tests for all routes
   - Integration tests with Firestore emulator
   - OpenAPI/Swagger documentation
   - Deployment guide

## Success Criteria

- [ ] REST API service created with Express/Fastify
- [ ] All 11 API endpoints implemented and tested
- [ ] Authentication middleware validates Firebase Auth tokens
- [ ] Validation middleware uses Zod schemas from task-core
- [ ] Error handling returns consistent JSON responses
- [ ] Dockerfile builds successfully
- [ ] Service deploys to Cloud Run
- [ ] Health check endpoint responds correctly
- [ ] All unit tests pass (30+ tests)
- [ ] Integration tests pass with Firestore emulator
- [ ] API documentation complete (OpenAPI spec)
- [ ] Service scales from 0 to 100 instances

## Key Files to Create

### task-rest-service Project Structure
```
task-rest-service/
├── src/
│   ├── server.ts                      # Express/Fastify server
│   ├── app.ts                         # App configuration
│   │
│   ├── routes/
│   │   ├── index.ts                   # Route registration
│   │   ├── tasks.ts                   # Task CRUD routes
│   │   ├── milestones.ts              # Milestone routes
│   │   ├── task-items.ts              # Task item routes
│   │   ├── messages.ts                # Message routes
│   │   └── health.ts                  # Health check
│   │
│   ├── middleware/
│   │   ├── auth.ts                    # Firebase Auth middleware
│   │   ├── validation.ts              # Zod validation middleware
│   │   ├── error-handler.ts           # Error handling middleware
│   │   └── logger.ts                  # Request logging
│   │
│   └── utils/
│       ├── response.ts                # Response helpers
│       └── errors.ts                  # Custom error classes
│
├── __tests__/
│   ├── routes/
│   │   ├── tasks.spec.ts
│   │   ├── milestones.spec.ts
│   │   ├── task-items.spec.ts
│   │   └── messages.spec.ts
│   ├── middleware/
│   │   ├── auth.spec.ts
│   │   └── validation.spec.ts
│   └── integration/
│       └── api.e2e.ts
│
├── agent/                             # ACP documentation
│   ├── design/
│   │   ├── requirements.md
│   │   └── api-design.md
│   ├── milestones/
│   │   └── milestone-1-rest-api.md
│   ├── tasks/
│   │   ├── task-1-project-setup.md
│   │   ├── task-2-api-routes.md
│   │   ├── task-3-middleware.md
│   │   ├── task-4-cloud-run-deployment.md
│   │   └── task-5-testing-documentation.md
│   └── progress.yaml
│
├── Dockerfile
├── cloudbuild.yaml
├── .dockerignore
├── package.json
├── tsconfig.json
├── esbuild.build.js
├── jest.config.js
├── openapi.yaml                       # API documentation
├── README.md
├── CHANGELOG.md
└── .gitignore
```

## API Endpoints

### Task Management
```
POST   /api/tasks              # Create task
GET    /api/tasks              # List tasks (with pagination)
GET    /api/tasks/:id          # Get task by ID
PATCH  /api/tasks/:id          # Update task
DELETE /api/tasks/:id          # Delete task
PATCH  /api/tasks/:id/status   # Update task status
```

### Milestone Management
```
POST   /api/tasks/:id/milestones                # Create milestone
PATCH  /api/tasks/:id/milestones/:milestoneId   # Update milestone
POST   /api/tasks/:id/milestones/:milestoneId/complete  # Complete milestone
```

### Task Item Management
```
POST   /api/tasks/:id/tasks                     # Create task item
PATCH  /api/tasks/:id/tasks/:taskId             # Update task item
POST   /api/tasks/:id/tasks/:taskId/complete    # Complete task item
```

### Message Management
```
GET    /api/tasks/:id/messages  # Get task messages
POST   /api/tasks/:id/messages  # Add message to task
```

### Health Check
```
GET    /health                  # Health check endpoint
```

## Technical Decisions

1. **Web Framework**: Express (widely used, good ecosystem)
2. **Authentication**: Firebase Auth tokens (consistent with agentbase.me)
3. **Validation**: Zod schemas from task-core
4. **Deployment**: Google Cloud Run (serverless, auto-scaling)
5. **Container**: Docker (Cloud Run requirement)
6. **Port**: 8080 (Cloud Run default)

## Dependencies

```json
{
  "dependencies": {
    "@prmichaelsen/task-core": "^1.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-validator": "^7.0.0",
    "firebase-admin": "^13.6.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jest": "^29.5.14",
    "@types/node": "^25.2.3",
    "esbuild": "^0.27.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "typescript": "^5.9.3"
  }
}
```

## Cloud Run Configuration

### Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.js"]
```

### Cloud Run Settings
- **CPU**: 1 vCPU
- **Memory**: 512 MB
- **Min Instances**: 0 (scale to zero)
- **Max Instances**: 100
- **Concurrency**: 80 requests per instance
- **Timeout**: 60 seconds
- **Port**: 8080

### Environment Variables
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON=<base64-encoded-json>
PORT=8080
NODE_ENV=production
```

## Authentication Flow

1. Client sends request with `Authorization: Bearer <firebase-token>` header
2. Auth middleware validates token using Firebase Admin SDK
3. Middleware extracts `userId` from token
4. Request proceeds with `req.userId` set
5. Routes use `userId` for user-scoped operations

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with ID 'abc123' not found",
    "status": 404
  }
}
```

### Error Codes
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `TASK_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `INTERNAL_ERROR` (500)

## Risks and Mitigation

**Risk**: Cold start latency on Cloud Run
- **Mitigation**: Keep min instances at 1 for production, use warm-up requests

**Risk**: Authentication bypass
- **Mitigation**: Comprehensive auth middleware tests, security audit

**Risk**: Rate limiting needed
- **Mitigation**: Implement rate limiting middleware (future enhancement)

**Risk**: CORS configuration issues
- **Mitigation**: Configure CORS for agentbase.me domain only

## Next Milestone

[Milestone 5: Integration and Testing](milestone-5-integration-testing.md)

---

**Status**: Not Started
**Estimated Effort**: 40 hours (1 week)
**Priority**: High
**Owner**: Development Team
**Last Updated**: 2026-02-18

## Task List

- [ ] Task 105: Initialize task-rest-service Project (2 hours)
- [ ] Task 106: Implement Task CRUD Routes (4 hours)
- [ ] Task 107: Implement Milestone Routes (2 hours)
- [ ] Task 108: Implement Task Item Routes (2 hours)
- [ ] Task 109: Implement Message Routes (2 hours)
- [ ] Task 110: Implement Health Check Route (1 hour)
- [ ] Task 111: Implement Auth Middleware (2 hours)
- [ ] Task 112: Implement Validation Middleware (2 hours)
- [ ] Task 113: Implement Error Handling (2 hours)
- [ ] Task 114: Create Dockerfile (2 hours)
- [ ] Task 115: Configure Cloud Run Deployment (3 hours)
- [ ] Task 116: Write Unit Tests (4 hours)
- [ ] Task 117: Write Integration Tests (3 hours)
- [ ] Task 118: Create API Documentation (2 hours)
- [ ] Task 119: Deploy to Cloud Run (2 hours)

**Total**: 35 hours estimated
