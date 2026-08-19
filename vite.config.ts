import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// PC = serveur, iPad = ecran : host: true fait ecouter Vite sur 0.0.0.0,
// c'est ce reglage qui rend le rendu joignable depuis l'iPad.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.loca.lt', '.ngrok.io'],
    // Le front appelle /api/devis en relatif ; Vite relaie vers Express.
    // Sans ce proxy, une page ouverte depuis l’iPhone appellerait le
    // localhost:3001 DU TELEPHONE, qui n’existe pas.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4174,
    strictPort: true,
  },
})
