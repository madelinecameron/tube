'use strict'

const html = require('choo/html')
const request = require('superagent')
const getFormData = require('get-form-data')
const moment = require('moment')
const webWorker = require('webworkify')

module.exports = (state, emit) => {
  const search = (e) => {
    e.preventDefault()

    const data = getFormData(e.target)

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
  return html`
    <div>
      <section class="mt3 tc">
        <div class="flex justify-center">
          <div id="header" class="f2 flex">Tube</div>
        </div>
        <div class="mt2 flex flex-column justify-center items-center" id="signup">
          <div class="w-50">
            Minimalist YouTube
            <br><br>
            DM me on Twitter (<a href="https://twitter.com/madamelic" target="_blank">@madamelic</a>) for questions or problems
          </div>
          <form class="mt3" onsubmit=${search}>
            <input type="text" class="pa2" name="searchTerm" value=${state.searchTerm || ''}>
            <button type="submit" class="pa2">${state.buttonContents || 'Search'}</button>
          </form>
        </div>
      </section>
      <section id="videos" class="flex flex-column pl4">
        ${(() => {
          return (state.videos || []).map(video => {
            return html`
              <a href="/watch?v=${video.id}" class="flex justify-center">
                <div class="video flex mb3 w-50 items-center">
                  <div>
                    <img src="${video.thumbnail}" alt="${video.title}">
                  </div>
                  <div class="flex flex-column pl3">
                    <div class="b ttl">${video.title}</div>
                  </div>
                </div>
              </a>
            `
          })
        })()}
      </section>
    </div>
  `
}