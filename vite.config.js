import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://realestate-t3v6.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://realestate-t3v6.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
