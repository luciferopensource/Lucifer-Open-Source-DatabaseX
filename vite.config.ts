import { execFileSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
    __BUILD_TIME__: JSON.stringify(builtAt),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
