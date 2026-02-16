# Bootstrap Pattern: TanStack Start + Cloudflare Workers + Firebase

**Complete Project Replication Guide**

**Pattern Type**: Project Initialization  
**Tech Stack**: TanStack Start, Cloudflare Workers, Vite, TypeScript, Tailwind CSS v4, Firebase, Vitest  
**Created**: 2026-02-13  
**Status**: Production Pattern  

---

## Overview

This document provides a **comprehensive, step-by-step guide** to replicate the agentbase.me project from complete scratch. It covers the entire tech stack, build processes, configuration files, deployment setup, and architectural patterns.

**Use this document to**:
- Initialize a new TanStack Start + Cloudflare Workers project
- Set up Firebase authentication and Firestore
- Configure Tailwind CSS v4 with Vite
- Implement Durable Objects for WebSocket chat
- Set up Vitest for testing
- Deploy to Cloudflare Workers

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [Core Dependencies](#core-dependencies)
4. [TypeScript Configuration](#typescript-configuration)
5. [Vite Configuration](#vite-configuration)
6. [Tailwind CSS v4 Setup](#tailwind-css-v4-setup)
7. [TanStack Router Setup](#tanstack-router-setup)
8. [Cloudflare Workers Configuration](#cloudflare-workers-configuration)
9. [Firebase Setup](#firebase-setup)
10. [Durable Objects Setup](#durable-objects-setup)
11. [Testing Setup (Vitest)](#testing-setup-vitest)
12. [Project Structure](#project-structure)
13. [Environment Variables](#environment-variables)
14. [Development Workflow](#development-workflow)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# Node.js 18+ (LTS recommended)
node --version  # Should be >= 18.0.0

# npm (comes with Node.js)
npm --version

# Cloudflare Wrangler CLI
npm install -g wrangler
wrangler --version

# Git
git --version
```

### Required Accounts

- **Cloudflare Account**: For Workers deployment
- **Firebase Project**: For authentication and Firestore
- **Google Cloud Project**: For service accounts (optional, for advanced features)

---

## Project Initialization

### Step 1: Create Project Directory

```bash
# Create project directory
mkdir my-project
cd my-project

# Initialize git
git init

# Initialize npm project
npm init -y
```

### Step 2: Initialize ACP (Agent Context Protocol)

```bash
# Install ACP (Agent Context Protocol)
curl -fsSL https://raw.githubusercontent.com/prmichaelsen/agent-context-protocol/mainline/scripts/install.sh | bash

# This automatically creates:
# - AGENT.md (ACP documentation)
# - agent/ directory structure
# - agent/scripts/ (check-for-updates.sh, update.sh, uninstall.sh)
# - agent/progress.yaml (progress tracking template)
# - All necessary .gitkeep files

# Customize progress.yaml for your project
cat > agent/progress.yaml << 'EOF'
project:
  name: my-project
  version: 0.1.0
  started: 2026-02-13
  status: in_progress

progress:
  planning: 10%
  implementation: 0%
  overall: 5%

recent_work:
  - date: 2026-02-13
    description: Project initialized
    items:
      - ✅ Created project structure
      - ✅ Initialized ACP
      - 📋 Ready to begin implementation

next_steps:
  - Install dependencies
  - Configure TypeScript
  - Set up Vite and TanStack Start

notes: []
current_blockers: []
EOF
```

### Step 3: Create .gitignore

```bash
cat > .gitignore << 'EOF'
node_modules
.DS_Store
dist
dist-ssr
*.local
.env
.nitro
.tanstack
.output
.vinxi

logs
*.log
EOF
```

---

## Core Dependencies

### Step 4: Install Dependencies

```bash
# Core framework dependencies
npm install \
  @tanstack/react-router@^1.132.0 \
  @tanstack/react-start@^1.132.0 \
  @tanstack/router-plugin@^1.132.0 \
  @tanstack/nitro-v2-vite-plugin@^1.132.31 \
  react@^19.0.0 \
  react-dom@^19.0.0

# Vite and plugins
npm install \
  vite@^7.1.7 \
  @vitejs/plugin-react@^5.0.4 \
  vite-tsconfig-paths@^5.1.4

# Cloudflare Workers
npm install \
  @cloudflare/vite-plugin@^1.23.1 \
  @cloudflare/workers-types@^4.20260207.0

# Tailwind CSS v4
npm install \
  tailwindcss@^4.0.6 \
  @tailwindcss/vite@^4.0.6

# Firebase
npm install \
  @prmichaelsen/firebase-admin-sdk-v8@^2.2.2 \
  @prmichaelsen/firebase-client-v8@^1.1.2

# Utilities
npm install \
  zod@^4.3.6 \
  jsonwebtoken@^9.0.3 \
  lucide-react@^0.544.0 \
  fuse.js@^7.1.0

# Chat and AI
npm install \
  @anthropic-ai/bedrock-sdk@^0.26.3 \
  @anthropic-ai/sdk@^0.74.0 \
  @modelcontextprotocol/sdk@^1.26.0 \
  @prmichaelsen/mcp-auth@^0.2.0

# Markdown rendering
npm install \
  react-markdown@^10.1.0 \
  react-syntax-highlighter@^16.1.0

# Dev dependencies
npm install -D \
  typescript@^5.7.2 \
  @types/node@^22.10.2 \
  @types/react@^19.0.8 \
  @types/react-dom@^19.0.3 \
  @types/jsonwebtoken@^9.0.10 \
  @types/react-syntax-highlighter@^15.5.13 \
  tsx@^4.21.0 \
  dotenv@^17.2.4

# Testing
npm install -D \
  vitest@^4.0.18 \
  @vitest/ui@^4.0.18
```

---

## TypeScript Configuration

### Step 5: Create tsconfig.json

```bash
cat > tsconfig.json << 'EOF'
{
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "noEmit": true,

    /* Linting */
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
EOF
```

**Key Configuration Points**:
- `target: "ES2022"` - Modern JavaScript features
- `moduleResolution: "bundler"` - Vite bundler mode
- `paths: { "@/*": ["./src/*"] }` - Path aliases for clean imports
- `strict: true` - Full TypeScript strictness
- `noEmit: true` - Vite handles compilation

---

## Vite Configuration

### Step 6: Create vite.config.ts

```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  plugins: [
    // Cloudflare Workers integration
    cloudflare({
      viteEnvironment: { name: 'ssr' },
    }),
    
    // TypeScript path resolution
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    
    // Tailwind CSS v4
    tailwindcss(),
    
    // TanStack Start (must come after tailwindcss)
    tanstackStart(),
    
    // React plugin (must come last)
    viteReact(),
  ],
})

export default config
EOF
```

**Plugin Order Matters**:
1. `cloudflare()` - Sets up Workers environment
2. `viteTsConfigPaths()` - Resolves `@/` imports
3. `tailwindcss()` - Processes Tailwind directives
4. `tanstackStart()` - TanStack Start framework
5. `viteReact()` - React JSX transformation

---

## Tailwind CSS v4 Setup

### Step 7: Create Tailwind Configuration

```bash
# Create src directory
mkdir -p src

# Create styles.css with Tailwind v4 import
cat > src/styles.css << 'EOF'
@import "tailwindcss";

body {
  @apply m-0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
}
EOF
```

**Tailwind CSS v4 Changes**:
- No `tailwind.config.js` file needed
- Use `@import "tailwindcss"` instead of `@tailwind` directives
- Configuration via `@tailwindcss/vite` plugin
- Faster build times with native CSS

---

## TanStack Router Setup

### Step 8: Create Router Configuration

```bash
# Create router.tsx
cat > src/router.tsx << 'EOF'
import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })
}
EOF

# Create root route
mkdir -p src/routes
cat > src/routes/__root.tsx << 'EOF'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/react-start'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My Project</title>
        <Meta />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
EOF

# Create index route
cat > src/routes/index.tsx << 'EOF'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Welcome</h1>
        <p className="text-xl text-gray-300">TanStack Start + Cloudflare Workers</p>
      </div>
    </div>
  )
}
EOF
```

**TanStack Router Patterns**:
- File-based routing in `src/routes/`
- `__root.tsx` - Root layout with HTML structure
- `index.tsx` - Homepage at `/`
- `routeTree.gen.ts` - Auto-generated by TanStack plugin
- Use `createFileRoute()` for type-safe routes

---

## Cloudflare Workers Configuration

### Step 9: Create Server Entry Point

```bash
# Create server.ts
cat > src/server.ts << 'EOF'
/**
 * Custom Server Entry Point
 * 
 * Exports Durable Objects and other Cloudflare Workers-specific handlers.
 * This file is referenced by wrangler.toml as the main entry point.
 */

// Export Durable Objects (if any)
// export { ChatRoom } from './durable-objects/ChatRoom'

// Re-export the default TanStack Start server entry
export { default } from '@tanstack/react-start/server-entry'
EOF
```

### Step 10: Create Wrangler Configuration

```bash
cat > wrangler.toml << 'EOF'
name = "my-project"
main = ".output/server/index.mjs"
compatibility_date = "2025-10-16"
compatibility_flags = ["nodejs_compat"]

# Assets
[site]
bucket = ".output/public"

# Environment variables (non-sensitive)
[vars]
NODE_ENV = "production"

# Durable Objects (if needed)
# [[durable_objects.bindings]]
# name = "CHAT_ROOM"
# class_name = "ChatRoom"
# script_name = "my-project"

# [[migrations]]
# tag = "v1"
# new_classes = ["ChatRoom"]

# KV Namespaces (if needed)
# [[kv_namespaces]]
# binding = "MY_KV"
# id = "your-kv-namespace-id"

# R2 Buckets (if needed)
# [[r2_buckets]]
# binding = "MY_BUCKET"
# bucket_name = "my-bucket"
EOF
```

### Step 11: Generate Worker Types

```bash
# Generate Cloudflare Workers types
npx wrangler types

# This creates worker-configuration.d.ts with:
# - Env interface with all bindings
# - Durable Object types
# - KV/R2 types
```

---

## Firebase Setup

### Step 12: Create Firebase Configuration

```bash
# Create constant directory
mkdir -p src/constant

# Create appConfig.ts
cat > src/constant/appConfig.ts << 'EOF'
export const APP_NAME = 'myproject';
EOF

# Create collections.ts
cat > src/constant/collections.ts << 'EOF'
import { APP_NAME } from './appConfig';

/**
 * Get the database collection prefix based on environment
 * - Development: Uses DB_PREFIX env var or defaults to 'e0.{APP_NAME}'
 * - Production: Uses base APP_NAME
 */
const getBasePrefix = (): string => {
  const environment = process.env.ENVIRONMENT;
  if (environment && environment !== 'production' && environment !== 'prod') {
    return `${environment}.${APP_NAME}`;
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    const customPrefix = process.env.DB_PREFIX;
    if (customPrefix) {
      return customPrefix;
    }
    return `e0.${APP_NAME}`;
  }

  return APP_NAME;
};

export const BASE = getBasePrefix();
export const STORAGE_BASE = BASE.replace(/\./g, '_');

// Collections
export const USERS = `${BASE}.users`;

/**
 * Get user-scoped collection paths
 */
export function getUserConversations(userId: string): string {
  return `${BASE}.users/${userId}/conversations`;
}

export function getUserConversationMessages(userId: string, conversationId: string): string {
  return `${BASE}.users/${userId}/conversations/${conversationId}/messages`;
}

export function getUserCredentialsCollection(userId: string): string {
  return `${BASE}.users/${userId}/credentials`;
}

export function getUserOAuthIntegrationsCollection(userId: string): string {
  return `${BASE}.users/${userId}/oauth-integrations`;
}
EOF

# Create firebase.json (empty for now)
echo '{}' > firebase.json
```

**Firebase Patterns**:
- **Environment-aware prefixes**: `e0.myproject` (dev) vs `myproject` (prod)
- **User-scoped collections**: All user data under `users/{userId}/`
- **No user_id fields**: User ID implicit in path
- **Service account**: Use `@prmichaelsen/firebase-admin-sdk-v8` for server-side

---

## Durable Objects Setup

### Step 13: Create Durable Object (Optional)

```bash
# Create durable-objects directory
mkdir -p src/durable-objects

# Create example Durable Object
cat > src/durable-objects/ChatRoom.ts << 'EOF'
/**
 * ChatRoom Durable Object
 * 
 * Manages WebSocket connections for real-time chat.
 * Each user gets their own isolated ChatRoom instance.
 */

export class ChatRoom implements DurableObject {
  private state: DurableObjectState;
  private sessions: Set<WebSocket>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.sessions = new Set();
  }

  async fetch(request: Request): Promise<Response> {
    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.state.acceptWebSocket(server);
      this.sessions.add(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Expected WebSocket', { status: 400 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Handle incoming messages
    console.log('Received message:', message);
    
    // Broadcast to all sessions
    for (const session of this.sessions) {
      try {
        session.send(message);
      } catch (err) {
        this.sessions.delete(session);
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    this.sessions.delete(ws);
  }
}
EOF

# Update server.ts to export Durable Object
cat > src/server.ts << 'EOF'
/**
 * Custom Server Entry Point
 */

// Export Durable Objects
export { ChatRoom } from './durable-objects/ChatRoom'

// Re-export the default TanStack Start server entry
export { default } from '@tanstack/react-start/server-entry'
EOF

# Update wrangler.toml to register Durable Object
# (Uncomment the durable_objects sections in wrangler.toml)
```

**Durable Objects Patterns**:
- One instance per user (use `idFromName(userId)`)
- WebSocket connections for real-time features
- Persistent storage via `this.state.storage`
- Automatic hibernation when idle

---

## Testing Setup (Vitest)

### Step 14: Create Vitest Configuration

```bash
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/server.ts',
        'src/router.tsx',
        'src/routeTree.gen.ts',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
EOF

# Create example test
mkdir -p src/lib
cat > src/lib/example.spec.ts << 'EOF'
import { describe, it, expect } from 'vitest'

describe('Example Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})
EOF
```

**Vitest Patterns**:
- Colocate tests with source files (`.spec.ts` extension)
- Use `globals: true` for `describe`, `it`, `expect` without imports
- Configure path aliases to match tsconfig.json
- Use `@vitest/ui` for visual test runner

---

## Project Structure

### Step 15: Complete Directory Structure

```
my-project/
├── AGENT.md                        # ACP documentation
├── agent/                          # Agent directory
│   ├── design/                     # Design documents
│   ├── milestones/                 # Project milestones
│   ├── patterns/                   # Architectural patterns
│   ├── tasks/                      # Task documents
│   ├── scripts/                    # ACP utility scripts
│   ├── security/                   # Security audits
│   └── progress.yaml               # Progress tracking
│
├── src/
│   ├── routes/                     # TanStack Router routes
│   │   ├── __root.tsx              # Root layout
│   │   ├── index.tsx               # Homepage
│   │   └── api/                    # API routes
│   │
│   ├── components/                 # React components
│   │   ├── auth/                   # Auth components
│   │   ├── chat/                   # Chat components
│   │   └── ...
│   │
│   ├── lib/                        # Utilities and libraries
│   │   ├── auth/                   # Auth utilities
│   │   ├── chat/                   # Chat utilities
│   │   └── ...
│   │
│   ├── services/                   # Service layer (database access)
│   │   ├── *-database.service.ts  # Database services
│   │   └── *.service.ts            # API services
│   │
│   ├── schemas/                    # Zod schemas
│   ├── types/                      # TypeScript types
│   ├── constant/                   # Constants and config
│   ├── durable-objects/            # Cloudflare Durable Objects
│   │
│   ├── router.tsx                  # Router configuration
│   ├── server.ts                   # Server entry point
│   ├── styles.css                  # Global styles
│   └── routeTree.gen.ts            # Generated route tree
│
├── public/                         # Static assets
├── scripts/                        # Build and utility scripts
├── workers/                        # Worker scripts (if separate)
│
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Example environment variables
├── .gitignore                      # Git ignore rules
├── firebase.json                   # Firebase configuration
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
├── vitest.config.ts                # Vitest configuration
├── wrangler.toml                   # Cloudflare Workers config
└── worker-configuration.d.ts       # Generated Worker types
```

---

## Environment Variables

### Step 16: Create .env.example

```bash
cat > .env.example << 'EOF'
# Environment
NODE_ENV=development
ENVIRONMENT=e0
DB_PREFIX=dev-yourname

# Firebase Client (Public - safe to expose)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Private - server-side only)
FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Firebase (for server-side, duplicates of VITE_ vars)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# Admin
OWNER_EMAILS=admin@example.com,owner@example.com

# AWS Bedrock (for AI chat)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# OAuth Integrations (examples)
APP_INSTAGRAM_ID=your-instagram-app-id
APP_INSTAGRAM_SECRET=your-instagram-app-secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your-verify-token

APP_EVENTBRITE_CLIENT_ID=your-eventbrite-client-id
APP_EVENTBRITE_CLIENT_SECRET=your-eventbrite-client-secret
EOF

# Copy to .env and fill in real values
cp .env.example .env
```

**Environment Variable Patterns**:
- `VITE_*` - Exposed to client-side code
- `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY` - JSON string (server-only)
- `ENVIRONMENT` - Controls database prefix (e0, e1, production)
- `DB_PREFIX` - Custom prefix for dev sandboxes

---

## Development Workflow

### Step 17: Configure package.json

After installing dependencies in Step 4, manually edit `package.json` to add:

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev --port 3319 --host",
    "build": "vite build",
    "serve": "vite preview",
    "deploy": "npm run build && wrangler deploy",
    "cf-typegen": "wrangler types",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Manual Edits Needed**:
- `"name"` - Change to your project name (e.g., `"@yourorg/project-name"`)
- `"version"` - Set initial version
- `"repository"` - Add your git repository URL (optional)
- `"author"` - Add your name/email (optional)
- `"license"` - Set license (e.g., "MIT", "Apache-2.0")

**Note**: Dependencies are already installed from Step 4, so no need to run `npm install` again.

### Step 18: Development Commands

```bash
# Start development server
npm run dev
# Opens at http://localhost:3319

# Build for production
npm run build
# Output in .output/ directory

# Preview production build locally
npm run serve

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate Cloudflare types
npm run cf-typegen

# Deploy to Cloudflare
npm run deploy
```

---

## Deployment

### Step 19: Deploy to Cloudflare Workers

```bash
# 1. Login to Cloudflare
wrangler login

# 2. Create secrets (one-time setup)
wrangler secret put FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY
# Paste the JSON service account key

wrangler secret put AWS_SECRET_ACCESS_KEY
# Paste the AWS secret key

# 3. Build the project
npm run build

# 4. Deploy
wrangler deploy

# 5. View deployment
wrangler tail