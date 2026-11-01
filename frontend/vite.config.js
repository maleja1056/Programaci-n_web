
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Servidor de contenidos del backend (express.static): imágenes de
      // turismo de la portada
      '/publico': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})

