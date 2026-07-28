import http from 'node:http'
import app from './app.js'

const PORT = Number(process.env.PORT ?? 3003)
// Bind to loopback: nginx is the only thing that should be able to reach this.
const HOST = process.env.HOST ?? '127.0.0.1'

if (!process.env.YOUTUBE_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.warn('YOUTUBE_API_KEY is not set. Stations and search will return errors.')
}

/*
 * Plain HTTP on purpose. nginx terminates TLS and proxies here over loopback.
 * v1 ran TLS in Node *as well as* nginx, reading certs for tube.qnzl.co while
 * nginx held certs for quinzel.tech, which is why the SSL config kept breaking.
 */
const server = http.createServer(app)

server.listen(PORT, HOST, () => {
  console.log(`tube listening on http://${HOST}:${PORT}`)
})

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
