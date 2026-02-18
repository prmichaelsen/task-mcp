# Task 93: Initialize task-core Project

**Milestone**: Milestone 3 - Core Library Extraction
**Estimated Time**: 2 hours
**Dependencies**: None
**Status**: Not Started

---

## Objective

Initialize the `@prmichaelsen/task-core` npm package with TypeScript, build configuration, testing infrastructure, and ACP documentation structure.

## Steps

### 1. Create Project Directory

```bash
mkdir -p task-core
cd task-core
```

### 2. Initialize npm Package

```bash
npm init -y
```

Update `package.json`:
```json
{
  "name": "@prmichaelsen/task-core",
  "version": "1.0.0",
  "description": "Core business logic for task execution system",
  "type": "module",
  "main": "dist/index.js",
  "exports": {
    "./schemas": {
      "types": "./dist/schemas/task.d.ts",
      "import": "./dist/schemas/task.js"
    },
    "./dto": {
      "types": "./dist/dto/index.d.ts",
      "import": "./dist/dto/index.js"
    },
    "./services": {
      "types": "./dist/services/task-database.service.d.ts",
      "import": "./dist/services/task-database.service.js"
    },
    "./client": {
      "types": "./dist/client.d.ts",
      "import": "./dist/client.js"
    },
    "./constants": {
      "types": "./dist/constant/collections.d.ts",
      "import": "./dist/constant/collections.js"
    }
  },
  "scripts": {
    "build": "node esbuild.build.js",
    "build:watch": "node esbuild.watch.js",
    "clean": "rm -rf dist",
    "dev": "npm run build:watch",
    "test": "jest",
    "test:unit": "jest --testMatch='**/*.spec.ts'",
    "test:e2e": "jest --testMatch='**/*.e2e.ts'",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run clean && npm run build && npm test"
  },
  "keywords": [
    "task-execution",
    "firestore",
    "schemas",
    "business-logic"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "firebase-admin": "^13.6.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "@types/node": "^25.2.3",
    "esbuild": "^0.27.3",
    "jest": "^29.7.0",
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
    "declaration": true,
    "declarationMap": true,
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
    '!src/**/*.e2e.ts'
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
import { execSync } from 'child_process'

const entryPoints = [
  'src/schemas/task.ts',
  'src/dto/index.ts',
  'src/services/task-database.service.ts',
  'src/client.ts',
  'src/constant/collections.ts'
]

const sharedConfig = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  external: ['firebase-admin', 'zod']
}

// Build all entry points
await Promise.all(
  entryPoints.map(entry =>
    esbuild.build({
      ...sharedConfig,
      entryPoints: [entry],
      outdir: 'dist',
      outExtension: { '.js': '.js' }
    })
  )
)

// Generate TypeScript declarations
console.log('Generating TypeScript declarations...')
execSync('tsc --emitDeclarationOnly --declaration --declarationMap', {
  stdio: 'inherit'
})

console.log('Build complete!')
```

Create `esbuild.watch.js`:
```javascript
import esbuild from 'esbuild'

const entryPoints = [
  'src/schemas/task.ts',
  'src/dto/index.ts',
  'src/services/task-database.service.ts',
  'src/client.ts',
  'src/constant/collections.ts'
]

const sharedConfig = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  external: ['firebase-admin', 'zod']
}

// Create contexts for all entry points
const contexts = await Promise.all(
  entryPoints.map(entry =>
    esbuild.context({
      ...sharedConfig,
      entryPoints: [entry],
      outdir: 'dist',
      outExtension: { '.js': '.js' }
    })
  )
)

// Watch all contexts
await Promise.all(contexts.map(ctx => ctx.watch()))

console.log('Watching for changes...')
```

### 7. Create Directory Structure

```bash
mkdir -p src/{schemas,dto,services,constant}
mkdir -p __tests__/{schemas,dto,services}
mkdir -p agent/{design,milestones,tasks,patterns}
```

### 8. Create .gitignore

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
```

### 9. Create README.md

Create `README.md`:
```markdown
# @prmichaelsen/task-core

Core business logic for the task execution system. Provides schemas, DTOs, services, and Firebase client for task management.

## Installation

\`\`\`bash
npm install @prmichaelsen/task-core
\`\`\`

## Usage

### Schemas

\`\`\`typescript
import { TaskSchema, MilestoneSchema } from '@prmichaelsen/task-core/schemas'

const task = TaskSchema.parse(data)
\`\`\`

### DTOs

\`\`\`typescript
import { toTaskApiResponse } from '@prmichaelsen/task-core/dto'

const apiResponse = toTaskApiResponse(task)
\`\`\`

### Services

\`\`\`typescript
import { TaskDatabaseService } from '@prmichaelsen/task-core/services'

const task = await TaskDatabaseService.createTask(userId, title, description)
\`\`\`

### Firebase Client

\`\`\`typescript
import { FirebaseClient } from '@prmichaelsen/task-core/client'

const client = new FirebaseClient({ userId })
await client.connect()
\`\`\`

## License

MIT
```

### 10. Create CHANGELOG.md

Create `CHANGELOG.md`:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-02-18

### Added
- Initial release of task-core library
- Zod schemas for Task, Milestone, TaskItem
- DTO types and transformer functions
- TaskDatabaseService for Firestore operations
- FirebaseClient wrapper for multi-tenant access
- Collection path helpers

[Unreleased]: https://github.com/yourusername/task-core/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/task-core/releases/tag/v1.0.0
```

### 11. Initialize ACP Structure

Copy ACP files from task-mcp:
```bash
# Copy AGENT.md
cp ../task-mcp/AGENT.md ./AGENT.md

# Copy agent structure
cp -r ../task-mcp/agent/patterns ./agent/
cp -r ../task-mcp/agent/commands ./agent/

# Create initial progress.yaml
cat > agent/progress.yaml << 'EOF'
project:
  name: task-core
  version: 1.0.0
  started: 2026-02-18
  status: in_progress
  current_milestone: M1
  description: |
    Core business logic library for task execution system.
    Extracted from task-mcp to enable code reuse.

milestones:
  - id: M1
    name: Core Library Extraction
    status: in_progress
    progress: 10
    started: 2026-02-18
    completed: null
    estimated_weeks: 1
    tasks_completed: 1
    tasks_total: 12

tasks:
  milestone_1:
    - id: task-93
      name: Initialize task-core Project
      status: in_progress
      file: agent/tasks/task-93-initialize-task-core-project.md
      estimated_hours: 2
      completed_date: null

documentation:
  design_documents: 0
  milestone_documents: 1
  pattern_documents: 1
  task_documents: 1

progress:
  planning: 100
  implementation: 10
  testing: 0
  documentation: 50
  overall: 10

recent_work:
  - date: 2026-02-18
    description: Started Task 93 - Initialize task-core project
    items:
      - 📋 Created project structure
      - 📋 Configured TypeScript and build tools
      - 📋 Set up testing infrastructure

next_steps:
  - Complete Task 93: Initialize project
  - Start Task 94: Move core files from task-mcp

notes:
  - Extracted from task-mcp v0.4.0
  - Will be published as v1.0.0 (stable API)

current_blockers: []
EOF
```

### 12. Initialize Git Repository

```bash
git init
git add .
git commit -m "chore: initialize task-core project"
```

---

## Verification

- [ ] `package.json` created with correct name and exports
- [ ] All dependencies installed successfully
- [ ] TypeScript configuration compiles without errors
- [ ] Jest configuration loads correctly
- [ ] esbuild configuration exists
- [ ] Directory structure created
- [ ] `.gitignore` excludes build artifacts
- [ ] `README.md` documents basic usage
- [ ] `CHANGELOG.md` initialized
- [ ] ACP structure copied from task-mcp
- [ ] Git repository initialized
- [ ] `npm run typecheck` passes (no source files yet, should succeed)

---

## Expected Output

### Files Created
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest configuration
- `esbuild.build.js` - Build script
- `esbuild.watch.js` - Watch script
- `.gitignore` - Git ignore rules
- `README.md` - Documentation
- `CHANGELOG.md` - Version history
- `agent/progress.yaml` - Progress tracking

### Console Output
```
✓ npm install completed
✓ TypeScript configuration valid
✓ Jest configuration valid
✓ Directory structure created
✓ Git repository initialized
```

---

## Next Task

[Task 94: Move Core Files to task-core](task-94-move-core-files.md)

---

**Status**: Not Started
**Estimated Time**: 2 hours
**Priority**: High
**Owner**: Development Team
**Created**: 2026-02-18
