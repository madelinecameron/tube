'use strict'

const html = require('choo/html')
const request = require('superagent')
const getFormData = require('get-form-data')
const moment = require('moment')

module.exports = (state, emit) => {
  const back = (e) => {
    e.preventDefault()

    emit('pushState', '/')
  }

  return html`
    <div>
      <div class="mb3">
        <a href="#" onclick=${back} class="black">
          <i class="fal fa-arrow-alt-circle-left fa-3x"></i>
        </a>
      </div>
      <style>.embed-container { position: relative; padding-bottom: 46.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style>
      <div class="embed-container">
        <iframe src="https://www.youtube.com/embed/${state.query.v}" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  `

        // <div class="absolute" style="z-index:1">
      //   <a href="#" onclick=${back} class="black">
      //     <i class="fal fa-arrow-alt-circle-left fa-3x"></i>
      //   </a>
      // </div>
}