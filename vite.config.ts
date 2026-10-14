import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const core = [
  'react',
  'react-dom',
  'scheduler',
  '@tanstack',
  'axios',
  'zod',
  'cn',
  'clsx',
  'class-variance-authority',
  'tailwind-merge',
]

function chunkFor(id: string) {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('socket.io-client') || id.includes('engine.io-client')) return 'realtime'
  if (
    id.includes('/msw') ||
    id.includes('@mswjs') ||
    id.includes('socket.io-parser') ||
    id.includes('engine.io-parser')
  )
    return 'mocks'
  if (
    core.some(
      (name) =>
        id.includes(`/node_modules/${name}/`) || id.includes(`/node_modules/.pnpm/${name}@`),
    )
  )
    return 'vendor'
  return undefined
}

function preloadMocks(): Plugin {
  return {
    name: 'kurio-preload-mocks',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return []
        const files = Object.values(bundle).filter(
          (chunk) =>
            chunk.type === 'chunk' &&
            (chunk.name === 'mocks' || chunk.facadeModuleId?.endsWith('src/mocks/browser.ts')),
        )
        return files.map((chunk) => ({
          tag: 'link',
          attrs: { rel: 'modulepreload', href: `/${chunk.fileName}` },
          injectTo: 'head',
        }))
      },
    },
  }
}

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    preloadMocks(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks: chunkFor } },
  },
})
