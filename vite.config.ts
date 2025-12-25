import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore - path is a Node.js built-in
import path from 'path'
// @ts-ignore - url is a Node.js built-in
import { fileURLToPath } from 'url'

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/huma': {
        target: 'https://api.humahr.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/huma/, ''),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Log to debug - remove in production
            console.log('Proxying request:', req.url);
            console.log('Auth header:', req.headers.authorization);
            
            // Ensure Authorization header is forwarded
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        },
      },
    },
  },
})

