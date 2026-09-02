import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { tmdbGatewayPlugin } from './src/lib/tmdb/gateway-plugin'

export default defineConfig({
  plugins: [vue(), tailwindcss(), tmdbGatewayPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
