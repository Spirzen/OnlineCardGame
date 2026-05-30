/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Приключения Урала Батыра',
        short_name: 'Урал Батыр',
        description: 'Карточный рогалик по башкирскому эпосу',
        theme_color: '#0a0806',
        background_color: '#0a0806',
        display: 'standalone',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg}'],
      },
    }),
  ],
  base: './',
  test: {
    globals: true,
  },
});
