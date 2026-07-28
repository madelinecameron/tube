import path from 'node:path'
import { fileURLToPath } from 'node:url'
import compression from 'compression'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import api from './routes/api.js'

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const app = express()

// nginx terminates TLS in front of this, so the rate limiter needs the real client IP.
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // The IFrame API injects an inline style tag into the page.
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", 'https://www.youtube.com', 'https://s.ytimg.com'],
        frameSrc: ['https://www.youtube.com', 'https://www.youtube-nocookie.com'],
        imgSrc: ["'self'", 'data:', 'https://i.ytimg.com', 'https://*.ggpht.com'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    // The player needs to hand referrer info to YouTube to play embedded video.
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false
  })
)

app.use(compression())

/*
 * NO CORS HEADERS, DELIBERATELY.
 *
 * v1 sent `Access-Control-Allow-Origin: *` here, which turned /api/search into a
 * public, unauthenticated YouTube search API sitting in front of a private API key.
 * The YouTube API Services Developer Policies prohibit offering "an API service that
 * allows users to access any data or functionality directly or indirectly provided by
 * the YouTube API Services", and that is the single most likely reason this project
 * was flagged. Same-origin only. Do not add a CORS middleware back.
 */

// Outside /api on purpose: the container healthcheck must not eat rate-limit budget.
app.get('/healthz', (req, res) => res.json({ ok: true }))

app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Slow down a moment.' }
  }),
  api
)

app.use(
  express.static(dist, {
    maxAge: '1y',
    index: false,
    setHeaders(res, filePath) {
      // Hashed assets can be cached hard; the shell must not be.
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache')
    }
  })
)

app.get('/{*any}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(dist, 'index.html'))
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  if (res.headersSent) return next(err)
  res.status(500).send('Something broke.')
})

export default app
