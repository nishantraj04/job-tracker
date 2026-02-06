import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'JobTracker Pro',
        short_name: 'JobTracker',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2936/2936933.png', // Placeholder icon
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})