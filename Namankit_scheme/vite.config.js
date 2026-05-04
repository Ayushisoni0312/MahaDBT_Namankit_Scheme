import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/o/namankit-scheme',
  build: {
    outDir: './vite-build',
    rollupOptions: {
      external: [
        /^(?!@clayui\/css)@clayui.*$/,
      ],
    },
  },
  plugins: [
    react(), // ← automatic JSX runtime, no need for React imports
  ],
  server: {
    port: 5002,
    historyApiFallback: true,
    proxy: {
      '/o/c/pomasters': {
        target: 'https://mahadbt2-qa-dashboard.quantela.com',
        changeOrigin: true,
        secure: false,
      },
      '/o/c/atcmasters': {
        target: 'https://mahadbt2-qa-dashboard.quantela.com',
        changeOrigin: true,
        secure: false,
      },
      '/o/c': {
        target: 'https://mahadbt2-qa-dashboard.quantela.com',
        changeOrigin: true,
        secure: false,
      },
      '/o/headless-delivery': {
        target: 'https://mahadbt2-qa-dashboard.quantela.com',
        changeOrigin: true,
        secure: false,
      },
      '/o/headless-admin-user': {
        target: 'https://mahadbt2-qa-dashboard.quantela.com',
        changeOrigin: true,
        secure: false,
      },
      '/o/headless-admin-list-type': {
        target: 'https://mahadbt2-qa-dashboard.quantela.com',
        changeOrigin: true,
        secure: false,
      },
      '/o/notification': {
  target: 'https://mahadbt2-qa-dashboard.quantela.com',
  changeOrigin: true,
  secure: false,
},
    },
  },
});