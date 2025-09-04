// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Սա թույլ կտա ցանցային միացումներ
    port: 5173,
    open: true,
  },
});