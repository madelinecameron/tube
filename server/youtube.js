const ENDPOINT = 'https://www.googleapis.com/youtube/v3/search'

class YouTubeError extends Error {}

async function call(params) {
  // GOOGLE_API_KEY is the name v1 used; still accepted so an existing box keeps working.
  const key = process.env.YOUTUBE_API_KEY ?? process.env.GOOGLE_API_KEY

  if (!key) {
    throw new YouTubeError('Search is not configured on this server.')
  }

  const url = new URL(ENDPOINT)
  url.search = new URLSearchParams({ part: 'snippet', key, ...params })

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })

  if (!res.ok) {
    // Surface a generic message: upstream errors can echo the API key back.
    const detail = await res.text().catch(() => '')
    console.error('YouTube API %d: %s', res.status, detail.slice(0, 400))
    throw new YouTubeError(
      res.status === 403
        ? 'YouTube turned the request down (quota or key).'
        : 'YouTube is not answering right now.'
    )
  }

  return res.json()
}

const toVideo = (item) => ({
  id: item.id.videoId,
  title: item.snippet.title,
  channel: item.snippet.channelTitle,
  thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url
})

export async function searchVideos(q, pageToken) {
  const data = await call({
    q,
    type: 'video',
    // Filtering to embeddable up front avoids results that dead-end in the player.
    videoEmbeddable: 'true',
    safeSearch: 'moderate',
    maxResults: '12',
    ...(pageToken && { pageToken })
  })

  return {
    videos: (data.items ?? []).filter((item) => item.id?.videoId).map(toVideo),
    nextPageToken: data.nextPageToken ?? null
  }
}

/**
 * Resolve a station to something playable.
 *
 * Prefers a live stream, which is endless by definition and cannot run out.
 * Falls back to a playlist. No video or playlist IDs are hardcoded anywhere,
 * so nothing rots when a channel restarts a stream.
 */
export async function resolveStation(query) {
  const live = await call({
    q: query,
    type: 'video',
    eventType: 'live',
    videoEmbeddable: 'true',
    maxResults: '1'
  })

  const stream = (live.items ?? []).find((item) => item.id?.videoId)
  if (stream) {
    return { kind: 'live', videoId: stream.id.videoId, title: stream.snippet.title }
  }

  const playlists = await call({ q: query, type: 'playlist', maxResults: '1' })
  const playlist = (playlists.items ?? []).find((item) => item.id?.playlistId)

  if (!playlist) {
    throw new YouTubeError('Nothing playable came back for that station.')
  }

  return {
    kind: 'playlist',
    playlistId: playlist.id.playlistId,
    title: playlist.snippet.title
  }
}

export { YouTubeError }
