import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:8000'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        // Peticiones al API → backend Laravel
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        // Imágenes del storage → backend Laravel
        '/storage': {
          target: backendUrl,
          changeOrigin: true,
        },
        // Gemini API — evita CORS del navegador (el proxy corre en Node)
        '/gemini-proxy': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/gemini-proxy/, ''),
        },
      },
    },
  }
})
