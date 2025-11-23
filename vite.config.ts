import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['core-js'],
  },
  build: {
    commonjsOptions: {
      include: [/core-js/, /node_modules/],
    },
    rollupOptions: {
      external: (id) => {
        // Externalize all core-js modules to prevent resolution issues
        if (id.startsWith('core-js/')) {
          return true;
        }
        return false;
      },
    },
  },
})
