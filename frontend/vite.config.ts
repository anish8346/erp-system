import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import http from 'node:http'

const EXTS = /\.(tsx|ts|jsx|js|mjs|css)$/

const origSetHeader = http.ServerResponse.prototype.setHeader
http.ServerResponse.prototype.setHeader = function (name: string, value: any) {
  if (name.toLowerCase() === 'etag') return this
  return origSetHeader.call(this, name, value)
}

const origRemoveHeader = http.ServerResponse.prototype.removeHeader
http.ServerResponse.prototype.removeHeader = function (name: string) {
  if (name.toLowerCase() === 'etag') return this
  return origRemoveHeader.call(this, name)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  configureServer(server) {
    if (!server.httpServer) return

    server.httpServer.on('request', (req: any, res: any) => {
      const url: string = req.url || req.originalUrl || ''
      if (EXTS.test(url)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        res.setHeader('Pragma', 'no-cache')
      }
    })
  },
})
