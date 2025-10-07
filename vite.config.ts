// vite.config.ts
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: { port: 3000 },
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), tailwindcss(), viteReact(), tsconfigPaths()],
})
