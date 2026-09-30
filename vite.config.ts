import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Proxy API calls to the backend during development so the frontend
      // can use relative `/api/v1/...` URLs in every environment.
      proxy: env.VITE_API_PROXY_TARGET
        ? { '/api': { target: env.VITE_API_PROXY_TARGET, changeOrigin: true } }
        : undefined,
    },
    build: {
      target: 'es2022',
      // three.js + R3F (~240 kB gzip) live in the lazily loaded WebGL chunk;
      // the invitation shell renders with the CSS fallback until it arrives.
      chunkSizeWarningLimit: 1000,
    },
  }
})
