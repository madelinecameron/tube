// The IFrame Player API is loaded lazily and exactly once, on first play.
// Nothing YouTube-owned is fetched by the browser until you actually ask for a video.
let pending

export function loadYouTubeApi() {
  if (pending) return pending

  pending = new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT)

    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT)
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => {
      pending = undefined
      reject(new Error('Could not reach the YouTube player.'))
    }
    document.head.appendChild(script)
  })

  return pending
}

// A stable identity for a playback source, used as the Player's React key so that
// switching stations remounts the iframe instead of mutating a live player.
export const sourceKey = (source) =>
  source.kind === 'playlist' ? `pl:${source.playlistId}` : `v:${source.videoId}`
