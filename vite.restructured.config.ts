import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { cartographerPlugin } from '@replit/vite-plugin-cartographer';
import { runtimeErrorModalPlugin } from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig({
  plugins: [
    react(), 
    cartographerPlugin(), 
    runtimeErrorModalPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      
      // Alias pour les nouveaux modules
      'COMMON': path.resolve(__dirname, './COMMON'),
      'I_AM_CYBER': path.resolve(__dirname, './I_AM_CYBER'),
      'I_AM_mc2i': path.resolve(__dirname, './I_AM_mc2i'),
      'I_AM_DATA_IA': path.resolve(__dirname, './I_AM_DATA_IA'),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});