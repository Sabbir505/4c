import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const publicBase = process.env.VITE_PUBLIC_BASE || '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: publicBase,
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react'
          }

          if (id.includes('react-router')) {
            return 'vendor-router'
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }

          if (id.includes('echarts') || id.includes('zrender')) {
            return 'vendor-echarts'
          }

          if (
            id.includes('/three/') ||
            id.includes('@react-three') ||
            id.includes('three-stdlib') ||
            id.includes('camera-controls') ||
            id.includes('maath')
          ) {
            return 'vendor-three'
          }

          if (id.includes('@google/model-viewer')) {
            return 'vendor-model-viewer'
          }

          if (
            id.includes('react-markdown') ||
            id.includes('/unified/') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('micromark') ||
            id.includes('mdast') ||
            id.includes('unist') ||
            id.includes('hast') ||
            id.includes('vfile')
          ) {
            return 'vendor-markdown'
          }

          if (id.includes('/openai/')) {
            return 'vendor-openai'
          }
        },
      },
    },
  },
})
