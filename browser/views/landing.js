'use strict'

const html = require('choo/html')
const request = require('superagent')
const getFormData = require('get-form-data')
const moment = require('moment')

module.exports = (state, emit) => {
  const search = (e) => {
    e.preventDefault()

    const data = getFormData(e.target)

    state.searchTerm = data.searchTerm

    request('/api/search')
      .query({ term: data.searchTerm })
      .end((err, resp) => {
        if (err) {
          return
        }

        state.videos = resp.body

        emit('render')
      })
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
          </div>
          <form class="mt3" onsubmit=${search}>
            <input type="text" class="pa2" name="searchTerm" value=${state.searchTerm || ''}>
            <button type="submit" class="pa2">Search</button>
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
                    <div class="b">${video.title}</div>
                    <div>${video.description}</div>
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