import { useEffect, useRef, useState } from 'react'
import { loadYouTubeApi } from '../youtube.js'

/**
 * Wraps the official YouTube IFrame Player.
 *
 * Deliberately does not fight the player: no overlays are drawn on top of it, its
 * controls are never covered, and it is never sized below the 200x200 minimum.
 * Those are hard requirements of the YouTube API Required Minimum Functionality
 * rules, and the previous version of this site did not respect them.
 *
 * @param {{ source: object, onEnded?: () => void }} props
 */
export default function Player({ source, onEnded }) {
  const hostRef = useRef(null)
  const endedRef = useRef(onEnded)
  const [error, setError] = useState(null)

  endedRef.current = onEnded

  useEffect(() => {
    let cancelled = false
    let player

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return

        player = new YT.Player(hostRef.current, {
          // Serve the player from the no-cookie domain so YouTube sets nothing
          // until playback actually starts.
          host: 'https://www.youtube-nocookie.com',
          videoId: source.kind === 'playlist' ? undefined : source.videoId,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            iv_load_policy: 3,
            rel: 0,
            origin: window.location.origin,
            ...(source.kind === 'playlist' && {
              listType: 'playlist',
              list: source.playlistId
            })
          },
          events: {
            onReady: (e) => e.target.playVideo(),
            onError: () => setError('YouTube would not play that one.'),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED) endedRef.current?.()
            }
          }
        })
      })
      .catch((e) => setError(e.message))

    return () => {
      cancelled = true
      player?.destroy?.()
    }
  }, [])

  if (error) {
    return <p className="notice">{error}</p>
  }

  return (
    <div className="player">
      <div ref={hostRef} />
    </div>
  )
}
