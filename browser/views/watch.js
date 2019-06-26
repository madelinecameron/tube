'use strict'

const getFormData = require('get-form-data')
const request = require('superagent')
const html = require('choo/html')

module.exports = (state, emit) => {
  const back = (e) => {
    e.preventDefault()

    window.history.go(-1)
  }

  let player
  window.onYouTubeIframeAPIReady = () => {
    clearTimeout(fallbackLoad)
    player = new YT.Player('player', {
      videoId: state.query.v || state.videoList[0],
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    })
  }

  const fallbackLoad = setTimeout(() => {
    window.onYouTubeIframeAPIReady()
  }, 1500)

  function onPlayerReady(event) {
    event.target.playVideo()
  }

  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
      if (state.videoList && state.videoList.length > 0) {
        state.videoList.shift()
        player.loadVideoById(state.videoList[0])
      } else {
        window.history.go(-1)
      }
    }
  }

  const next = (e) => {
    e.preventDefault()

    state.videoList.shift()
    player.loadVideoById(state.videoList[0])
    player.startVideo()
  }

  return html`
    <div>
      <div class="mb3">
        <a href="#" onclick=${back} class="black no-underline ma3">
          Back
        </a>
      </div>
      <style>.player { position: relative; padding-bottom: 46.25%; height:100%; width:100%; overflow: hidden; max-width: 100%; } .player iframe, .player object, .player embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style>
      <script src="https://www.youtube.com/iframe_api"></script>
      <div class="flex w-100 h-100">
        <div id="player" class="player">
      </div>
      <div class="flex justify-center ml4">
        <div class="flex flex-column" id="playlist">
          ${(() => {
            if (state.videoList.length > 0) {
              return html`<div class="mb2"><a href="#" onclick=${next} class="b">Next</a></div>`
            }
          })()}
          ${(() => {
            return state.videoList.map(videoId => {
              const vid = state.videos.filter(vid => vid.id == videoId)[0]
              return html`<div class="pb2 ttl">${vid.title}</div>`
            })
          })()}
        </div>
      </div>
    </div>
  `
}