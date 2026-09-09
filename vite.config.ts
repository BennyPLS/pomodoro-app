import { paraglideVitePlugin } from '@inlang/paraglide-js'
// vite.config.ts
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_ENV !== 'production' ? '' : '/pomodoro-app/',
  // Vite 8 resolves tsconfig `paths` natively, replacing vite-tsconfig-paths.
  resolve: { tsconfigPaths: true },
  preview: { allowedHosts: true },
  server: { port: 3000 },
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
    }),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    tailwindcss(),
    // React Compiler runs through oxc in @vitejs/plugin-react v6+
    // (the v5 `babel` option was removed).
    viteReact({ compiler: true }),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Pomodoro App',
        short_name: 'Pomodoro',
        description: 'A Pomodoro timer app to boost your productivity.',
        start_url: '/pomodoro-app/',
        display: 'standalone',
        background_color: '#4d576a',
        theme_color: '#4d576a',
        orientation: 'portrait',
        categories: ['productivity', 'utilities', 'work', 'timer'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1053x593',
            type: 'image/png',
            label: 'Desktop view',
            form_factor: 'wide',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '406x895',
            type: 'image/png',
            label: 'Mobile view',
            form_factor: 'narrow',
          },
        ],
        related_applications: [],
        prefer_related_applications: false,
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*'],
        maximumFileSizeToCacheInBytes: 30_000_000,
      },
    }),
  ],
})
