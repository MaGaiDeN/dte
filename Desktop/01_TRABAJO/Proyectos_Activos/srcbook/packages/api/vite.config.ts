import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['crypto'],
      output: {
        globals: {
          crypto: 'crypto'
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  }
}); 