import express from 'express'
import { createCache } from '../cache.js'
import { YouTubeError, resolveStation, searchVideos } from '../youtube.js'

const router = express.Router()

// Station queries live here, server-side, so the client never dictates what gets
// searched for. The client can only name a station that already exists.
const STATIONS = {
  lofi: 'lofi hip hop radio beats to relax study to',
  jazz: 'jazz cafe music radio live',
  ambient: 'ambient space music radio live',
  classical: 'classical music radio live'
}

const searchCache = createCache({ ttlMs: 30 * 60 * 1000 })
const stationCache = createCache({ ttlMs: 6 * 60 * 60 * 1000, max: 32 })

const MAX_TERM = 120

router.get('/search', async (req, res, next) => {
  const q = String(req.query.q ?? '').trim().slice(0, MAX_TERM)
  const pageToken = String(req.query.pageToken ?? '').slice(0, 64)

  if (!q) {
    return res.status(400).json({ error: 'Give me something to search for.' })
  }

  if (pageToken && !/^[\w-]+$/.test(pageToken)) {
    return res.status(400).json({ error: 'Bad page token.' })
  }

  try {
    const result = await searchCache.wrap(
      `${q.toLowerCase()}::${pageToken}`,
      () => searchVideos(q, pageToken)
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/station/:id', async (req, res, next) => {
  const query = STATIONS[req.params.id]

  if (!query) {
    return res.status(404).json({ error: 'No such station.' })
  }

  try {
    const result = await stationCache.wrap(req.params.id, () => resolveStation(query))
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// Keep upstream detail out of responses; only our own messages are user-facing.
router.use((err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err instanceof YouTubeError) {
    return res.status(502).json({ error: err.message })
  }

  console.error('Unhandled API error:', err)
  res.status(500).json({ error: 'Something broke on our side.' })
})

export default router
