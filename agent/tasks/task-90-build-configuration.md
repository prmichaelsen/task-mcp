# Task 91: Build Configuration

**Milestone**: Milestone 2 - MCP Server Foundation
**Estimated Time**: 4 hours
**Dependencies**: Task 90 (MCP Server Implementation)
**Status**: Not Started

---

## Objective

Create esbuild configuration for bundling the MCP server for deployment. Set up both build and watch modes following the MCP Server Bootstrap Pattern.

## Steps

### 1. Install esbuild

```bash
npm install --save-dev esbuild
```

### 2. Create Build Script

Create `esbuild.build.js`:
- Bundle `src/server.ts` for standalone deployment
- Bundle `src/server-factory.ts` for library usage
- Target Node.js 20
- ESM format
- External dependencies: firebase-admin, @modelcontextprotocol/sdk
- Generate source maps
- Generate TypeScript declarations

### 3. Create Watch Script

Create `esbuild.watch.js`:
- Same configuration as build script
- Enable watch mode for development
- Auto-rebuild on file changes

### 4. Update package.json Scripts

Add build scripts:
```json
{
  "scripts": {
    "build": "node esbuild.build.js",
    "build:watch": "node esbuild.watch.js",
    "clean": "rm -rf dist",
    "dev": "npm run build:watch"
  }
}
```

### 5. Test Build

Run build and verify:
- `npm run build` succeeds
- `dist/server.js` created
- `dist/server-factory.js` created
- Type declarations generated
- No build errors

## Verification

- [ ] esbuild.build.js created
- [ ] esbuild.watch.js created
- [ ] Build succeeds without errors
- [ ] dist/ directory contains bundled files
- [ ] TypeScript declarations generated
- [ ] Source maps generated
- [ ] Watch mode works for development
- [ ] Bundle size is reasonable

## Example Build Script

```javascript
// esbuild.build.js
import * as esbuild from 'esbuild';
import { execSync } from 'child_process';

// Build standalone server
await esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/server.js',
  sourcemap: true,
  external: [
    'firebase-admin',
    '@modelcontextprotocol/sdk'
  ],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
  },
  alias: {
    '@': './src'
  }
});

// Build server factory
await esbuild.build({
  entryPoints: ['src/server-factory.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/server-factory.js',
  sourcemap: true,
  external: [
    'firebase-admin',
    '@modelcontextprotocol/sdk'
  ],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
  },
  alias: {
    '@': './src'
  }
});

console.log('✓ JavaScript bundles built');

// Generate TypeScript declarations
console.log('Generating TypeScript declarations...');
try {
  execSync('tsc --emitDeclarationOnly --outDir dist', { stdio: 'inherit' });
  console.log('✓ TypeScript declarations generated');
} catch (error) {
  console.error('✗ Failed to generate TypeScript declarations');
  process.exit(1);
}

console.log('✓ Build complete');
```

## Files to Create

- `esbuild.build.js`
- `esbuild.watch.js`
- Update `package.json` scripts

---

**Next Task**: [Task 92: Deployment Configuration](task-92-deployment-configuration.md)
