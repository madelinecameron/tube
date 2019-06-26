'use strict'

const getFormData = require('get-form-data')
const webWorker = require('webworkify')
const request = require('superagent')
const html = require('choo/html')

module.exports = (state, emit) => {
  if (!state.videos) {
    state.videos = []
    state.nextPageToken = ''
  }

  const search = (e) => {
    e.preventDefault()

    const data = getFormData(e.target)
    state.videos = []

    state.searchTerm = data.searchTerm
    state.nextPageToken = ''
    state.buttonContents = html`
      <i class="fal fa-spinner fa-pulse"></i>
    `
    state.worker = webWorker(require('../lib/findVideos'))
    state.worker.postMessage(JSON.stringify({ searchTerm: data.searchTerm }))
    state.worker.onmessage = (e) => {
      state.videos.push(...e.data.videos)

      state.query.q = data.searchTerm
      state.nextPageToken = e.data.pageInfo.nextPageToken
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
    state.worker.postMessage(JSON.stringify({ searchTerm: state.query.q }))
    state.worker.onmessage = (e) => {
      state.videos.push(...e.data.videos)

      state.nextPageToken = e.data.pageInfo.nextPageToken
      state.buttonContents = 'Search'
      emit('render')
    }

    emit('render')
  }

  const nextPage = (e) => {
    e.preventDefault()

    state.worker.postMessage(JSON.stringify({ searchTerm: state.query.q, token: state.nextPageToken }))
    state.worker.onmessage = (e) => {
        state.videos.push(...e.data.videos)

        state.nextPageToken = e.data.pageInfo.nextPageToken
        state.buttonContents = 'Search'
        emit('render')
    }
  }

  const playlist = (e) => {
    e.preventDefault()

    return emit('pushState', '/watch')
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
            ${(() => {
              if (state.videos.length > 0) {
                return html`
                  <div class="flex justify-center mt2 mb3">
                    <a class="black" onclick=${nextPage}>Next Page</a>
                  </div>
                `
              }
            })()}
          </div>
        </div>
      </div>
      <footer class="tc flex flex-column">
        <a href="/privacy.txt" target="_blank">Privacy Policy</a>
        ${(() => {
          if (window && window.external && window.external.IsSearchProviderInstalled && !window.external.IsSearchProviderInstalled('https://tube.qnzl.co')) {
            return html`<a href="#" onclick=${installPlugin}>Install Search</a>`
          }
        })()}
    </div>
  `
}