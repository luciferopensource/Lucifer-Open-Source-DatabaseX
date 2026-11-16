import { execFileSync } from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { getAggregatedDatabase } from './src/data/aggregateDatabase'

// execFileSync with an argument array: no shell, so no injection surface.
function gitValue(args: string[], fallback: string): string {
  try {
    return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return fallback
  }
}

const commit = gitValue(['rev-parse', '--short', 'HEAD'], 'dev')
const builtAt = new Date().toISOString()

/**
 * Emits the verified totals as JSON during the build so scripts/prerender.mjs
 * can bake real numbers into each static route shell. The values come from the
 * datasets, never from a hand-written list.
 */
function routeMetaPlugin(): Plugin {
  return {
    name: 'route-meta',
    apply: 'build',
    generateBundle() {
      const aggregate = getAggregatedDatabase()
      const meta = {
        archives: aggregate.archiveCount,
        files: aggregate.totalFiles,
        messages: aggregate.totalMessages,
        storage: aggregate.combinedStorage,
        storagePB: aggregate.combinedStoragePB,
        extensions: aggregate.extensionIntelligence.uniqueExtensionsCount,
        channels: aggregate.channelContributions.map((channel) => ({
          name: channel.displayName,
          files: channel.files,
          storage: channel.storage,
          scanId: channel.scanId,
        })),
      }
      this.emitFile({ type: 'asset', fileName: 'route-meta.json', source: JSON.stringify(meta, null, 2) })
    },
  }
}

export default defineConfig({
  plugins: [react(), routeMetaPlugin()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
    __BUILD_TIME__: JSON.stringify(builtAt),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
          data: ['./src/data/channelIntelligenceData.ts', './src/data/channelIntelligenceDataBackup2.ts'],
        },
      },
    },
  },
})
