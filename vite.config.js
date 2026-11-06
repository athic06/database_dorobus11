import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { localVoidDemo } from './server/void-demo.mjs'

export default defineConfig(({ command, mode }) => {
  const demo = command === 'serve' && mode === 'repair-demo'
  const env = demo ? loadEnv(mode, process.cwd(), 'GEMINI_') : {}
  return {
    plugins: [react(), ...(demo ? [localVoidDemo(env.GEMINI_API_KEY, env.GEMINI_MODEL)] : [])],
    server: demo ? { port: 5175, host: '127.0.0.1', strictPort: true } : { port: 5173 },
  }
})
