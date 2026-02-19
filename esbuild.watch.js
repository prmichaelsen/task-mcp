/**
 * esbuild Watch Script
 * 
 * Watches for file changes and rebuilds automatically during development.
 */

import * as esbuild from 'esbuild'

console.log('👀 Watching for changes...\n')

// Watch standalone server
const serverContext = await esbuild.context({
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

// Watch server factory
const factoryContext = await esbuild.context({
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

// Watch API client
const apiClientContext = await esbuild.context({
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

// Start watching all contexts
await Promise.all([
  serverContext.watch(),
  factoryContext.watch(),
  apiClientContext.watch()
])

console.log('✓ Watching for changes...')
console.log('  Press Ctrl+C to stop\n')

// Keep process alive
await new Promise(() => {})
