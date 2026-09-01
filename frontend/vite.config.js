import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le frontend tourne sur http://localhost:5173 et redirige les appels
// /api et /uploads vers le backend Spring Boot (http://localhost:8080).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
