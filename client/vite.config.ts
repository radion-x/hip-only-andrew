import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy for local development only (production uses direct API calls)
      '/api': {
        target: 'http://localhost:3000', // Backend server on port 3000
        changeOrigin: true,
      }
    }
  }
});
