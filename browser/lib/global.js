'use strict'

const request = require('superagent')
const pick = require('pick-random')

module.exports = (app) => {
  app.use((state, emitter) => {
    emitter.on('navigate', () => {
      state.successMessage = ''
      state.failureMessage = ''
      state.items = null
      state.item = null

      state.track(`navigate:${state.route.slice(1)}`)
    })

    state.track = (eventName) => {
      state.mixpanel.track(eventName)
      state.drift.track(eventName)
    }
  })
}