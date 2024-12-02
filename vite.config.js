import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://stageapi.monkcommerce.app', // The API's base URL
        changeOrigin: true, // Ensures the origin header is rewritten to match the target
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove "/api" from the request path
      },
    },
  },
});
