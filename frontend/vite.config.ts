import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'ssc_logo.png'],
      manifest: {
        name: 'SSC - School Song Contest',
        short_name: 'SSC',
        description: 'Eurovision-inspirierte Voting-App für Schulen',
        theme_color: '#e88d3c',
        background_color: '#fff7ed',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/ssc_logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/ssc_logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ssc\.schulapps\.at\/socket\.io/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
