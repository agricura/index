import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:    'index.html',
        activos: 'activos.html',
        cerezas: 'cerezas.html',
      },
    },
  },
})
