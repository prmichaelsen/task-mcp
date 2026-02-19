/**
 * esbuild Build Script
 * 
 * Bundles the task-mcp server and library for deployment.
 * Generates both JavaScript bundles and TypeScript declarations.
 */

import * as esbuild from 'esbuild'
import { execSync } from 'child_process'

console.log('🔨 Building task-mcp...\n')

// Build standalone server
console.log('Building standalone server...')
await esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/server.js',
  sourcemap: true,
  external: [
    '@modelcontextprotocol/sdk',
    '@prmichaelsen/task-core'
  ],
  banner: {
    js: '#!/usr/bin/env node\nimport { createRequire } from \'module\'; const require = createRequire(import.meta.url);'
  }
})
console.log('✓ Standalone server built')

// Build server factory
console.log('Building server factory...')
await esbuild.build({
  entryPoints: ['src/server-factory.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/server-factory.js',
  sourcemap: true,
  external: [
    '@modelcontextprotocol/sdk',
    '@prmichaelsen/task-core'
  ],
  banner: {
    js: 'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);'
  }
})
console.log('✓ Server factory built')

// Build API client
console.log('Building API client...')
await esbuild.build({
  entryPoints: ['src/api-client/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/api-client/index.js',
  sourcemap: true,
  external: ['@prmichaelsen/task-core'],
  banner: {
    js: 'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);'
  }
})
console.log('✓ API client built')

console.log('\n✓ JavaScript bundles built')

// Generate TypeScript declarations
console.log('\nGenerating TypeScript declarations...')
try {
  execSync('tsc --emitDeclarationOnly --outDir dist', { stdio: 'inherit' })
  console.log('✓ TypeScript declarations generated')
} catch (error) {
  console.error('✗ Failed to generate TypeScript declarations')
  process.exit(1)
}

console.log('\n✅ Build complete!')
