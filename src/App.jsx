import { useCallback, useEffect, useState } from 'react'
import { resolveStation, search } from './api.js'
import { STATIONS } from './stations.js'
import { sourceKey } from './youtube.js'
import Player from './components/Player.jsx'
import Results from './components/Results.jsx'

const readUrl = () => {
  const p = new URLSearchParams(window.location.search)
  return { q: p.get('q') ?? '', v: p.get('v') ?? '', s: p.get('s') ?? '' }
}

const writeUrl = (params, { replace = false } = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value)
  )
  const url = qs.size ? `/?${qs}` : '/'
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url)
}

export default function App() {
  const [term, setTerm] = useState(() => readUrl().q)
  const [videos, setVideos] = useState([])
  const [pageToken, setPageToken] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [source, setSource] = useState(null)
  const [nowPlaying, setNowPlaying] = useState('')
  const [error, setError] = useState(null)

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) return

    setBusy(true)
    setError(null)
    setSource(null)
    setVideos([])

    try {
      const { videos, nextPageToken } = await search(q)
      setVideos(videos)
      setPageToken(nextPageToken ?? null)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }, [])

  const playStation = useCallback(async (station) => {
    setBusy(true)
    setError(null)
    setVideos([])

    try {
      const resolved = await resolveStation(station.id)
      setSource(resolved)
      setNowPlaying(station.label)
      writeUrl({ s: station.id })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }, [])

  const playVideo = useCallback((video) => {
    setSource({ kind: 'video', videoId: video.id })
    setNowPlaying(video.title ?? '')
    writeUrl({ v: video.id })
  }, [])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)

    try {
      const next = await search(term, pageToken)
      setVideos((current) => [...current, ...next.videos])
      setPageToken(next.nextPageToken ?? null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingMore(false)
    }
  }, [term, pageToken])

  const goHome = useCallback(() => {
    setSource(null)
    setVideos([])
    setNowPlaying('')
    setError(null)
    writeUrl({})
  }, [])

  // A station that runs out (a finite playlist) re-resolves so it stays endless.
  // A video you picked yourself hands you back to a blank page rather than
  // autoplaying you into something you did not choose.
  const handleEnded = useCallback(() => {
    const station = STATIONS.find((s) => s.label === nowPlaying)
    if (station) return playStation(station)
    goHome()
  }, [nowPlaying, playStation, goHome])

  // Restore state from the URL on first paint and on back/forward.
  useEffect(() => {
    const sync = () => {
      const { q, v, s } = readUrl()
      const station = STATIONS.find((entry) => entry.id === s)

      if (station) return playStation(station)
      if (v) {
        setSource({ kind: 'video', videoId: v })
        return
      }
      setSource(null)
      if (q) {
        setTerm(q)
        return runSearch(q)
      }
      setVideos([])
    }

    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [playStation, runSearch])

  const onSubmit = (e) => {
    e.preventDefault()
    writeUrl({ q: term })
    runSearch(term)
  }

  if (source) {
    return (
      <main className="watch">
        <button type="button" className="back" onClick={goHome}>
          ← back
        </button>
        <Player key={sourceKey(source)} source={source} onEnded={handleEnded} />
        {nowPlaying && <p className="playing">{nowPlaying}</p>}
        <Attribution />
      </main>
    )
  }

  return (
    <main className="home">
      <h1>tube</h1>

      <form onSubmit={onSubmit} role="search">
        <input
          type="search"
          name="q"
          value={term}
          onInput={(e) => setTerm(e.currentTarget.value)}
          placeholder="search"
          autoComplete="off"
          autoFocus
          aria-label="Search YouTube"
        />
        <button type="submit" disabled={busy}>
          {busy ? '…' : 'go'}
        </button>
      </form>

      <div className="stations">
        {STATIONS.map((station) => (
          <button key={station.id} type="button" onClick={() => playStation(station)}>
            {station.label}
          </button>
        ))}
      </div>

      {error && <p className="notice">{error}</p>}

      {videos.length > 0 && (
        <>
          <Results
            videos={videos}
            onPick={playVideo}
            onMore={pageToken ? loadMore : null}
            loadingMore={loadingMore}
          />
          <Attribution />
        </>
      )}
    </main>
  )
}

// Required by the YouTube API Terms of Service: results and playback must be
// visibly attributed to YouTube as the source.
function Attribution() {
  return (
    <footer className="attribution">
      <a href="https://www.youtube.com" target="_blank" rel="noreferrer noopener">
        Powered by YouTube
      </a>
      <a href="/privacy.html">Privacy</a>
    </footer>
  )
}
