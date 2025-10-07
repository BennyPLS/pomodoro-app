// vite.config.ts
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'

import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'

export default defineConfig({
  server: { port: 3000 },
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), tailwindcss(), viteReact(), tsconfigPaths()],
})
