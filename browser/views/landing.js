'use strict'

const getFormData = require('get-form-data')
const webWorker = require('webworkify')
const request = require('superagent')
const html = require('choo/html')

module.exports = (state, emit) => {
  const search = (e) => {
    e.preventDefault()

    const data = getFormData(e.target)

    state.searchTerm = data.searchTerm
    state.buttonContents = html`
      <i class="fal fa-spinner fa-pulse"></i>
    `
    state.worker = webWorker(require('../lib/findVideos'))
    state.worker.postMessage(data.searchTerm)
    state.worker.onmessage = (e) => {
        state.videos = e.data 

        state.buttonContents = 'Search'
        emit('render')
    }

    emit('render')
  }

  const installPlugin = (e) => {
    e.preventDefault()

    if (window.external) {
      window.external.AddSearchProvider('/search.xml')
    }
  }

  const addToPlaylist = (id) => {
    return (e) => {
      e.preventDefault()

      state.videoList.push(id)

      emit('render')
    }
  }

  if (!state.videoList) {
    state.videoList = []
  }

  if (state.query.q && !state.videos) {
    state.buttonContents = html`
      ...
    `
    state.worker = webWorker(require('../lib/findVideos'))
    state.worker.postMessage(state.query.q)
    state.worker.onmessage = (e) => {
        state.videos = e.data 

        state.buttonContents = 'Search'
        emit('render')
    }

    emit('render')
  }

  const playlist = (e) => {
    e.preventDefault()

    emit('pushState', '/playlist')
  }

  return html`
    <div>
      <section class="mt3 tc">
        <div class="flex justify-center">
          <div id="header" class="f2 flex">Tube</div>
        </div>
        <div class="mt2 flex flex-column justify-center items-center" id="signup">
          <div class="w-50">
            Minimalist YouTube (not affliated or endorsed)
            <br><br>
            DM me on Twitter (<a href="https://twitter.com/madamelic" target="_blank">@madamelic</a>) for questions or problems
          </div>
          <form class="mt3" onsubmit=${search}>
            <input type="text" class="pa2" name="searchTerm" value=${state.searchTerm || state.query.q || ''}>
            <button type="submit" class="pa2">${state.buttonContents || 'Search'}</button>
          </form>
        </div>
      </section>
      <div class="mw9 center ph3-ns">
        <div class="cf ph2-ns flex-ns">
          <div class="flex pl3 flex-column w-10-ns mb3 order-1-ns" id="playlist">
            ${(() => {
              if (state.videoList.length > 0) {
                return html`<div class="mb2"><a href="#" onclick=${playlist} class="no-underline">▶️</a></div>`
              }
            })()}
            ${(() => {
              return state.videoList.map(videoId => {
                const vid = state.videos.filter(vid => vid.id == videoId)[0]
                return html`<div class="pb2 ttl">${vid.title}</div>`
              })
            })()}
          </div>
          <div id="videos" class="flex flex-column pr4 w-90-ns order-0-ns">
            ${(() => {
              return (state.videos || []).map(video => {
                return html`
                  <a href="/watch?v=${video.id}" class="flex justify-center no-underline">
                    <div class="video flex mb3 w-50 items-center">
                      <div class="pr2">
                        <a href="#" onclick=${addToPlaylist(video.id)} class="no-underline">+</a>
                      </div>
                      <div>
                        <img src="${video.thumbnail}" alt="${video.title}">
                      </div>
                      <div class="flex flex-column pl3">
                        <div class="b ttl underline">${video.title}</div>
                      </div>
                    </div>
                </a>
                `
              })
            })()}
          </div>
        </div>
      </div>
      <footer class="tc flex flex-column">
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" class="mb1">
          <input type="hidden" name="cmd" value="_s-xclick">
          <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----
          ">
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
          <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
        </form>
        <a href="/privacy.txt" target="_blank">Privacy Policy</a>
        ${(() => {
          if (window && window.external && window.external.IsSearchProviderInstalled && !window.external.IsSearchProviderInstalled('https://tube.quinzel.tech')) {
            return html`<a href="#" onclick=${installPlugin}>Install Search</a>`
          }
        })()}
    </div>
  `
}