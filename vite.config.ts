import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Publicado en GitHub Pages bajo /trainoelias/
  base: '/trainoelias/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Incluye las imágenes de ejercicios para que funcione sin internet
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,jpg}'] },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Trainoelias',
        short_name: 'Trainoelias',
        description: 'Calistenia progresiva, piernas, escalada y movilidad',
        lang: 'es',
        theme_color: '#ea580c',
        background_color: '#0f1216',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
