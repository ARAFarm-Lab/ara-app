import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ARA Farm IoT Panel',
        short_name: 'ARA IoT Panel',
        description: 'ARA Farm IoT Management Panel',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '3360x1748',
            form_factor: 'wide',
            type: 'image/png'
          },
          {
            src: 'screenshot-narrow.jpeg',
            sizes: '778x1600',
            form_factor: 'narrow',
            type: 'image/jpeg'
          },
        ]
      }
    })
  ],
})