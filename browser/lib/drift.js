'use strict'

module.exports = (app) => {
  app.use((state, emitter) => {
    state.drift = {
      track: (eventName) => {
        window.drift.track(eventName)
      },
      identify: (id, email) => {
        window.drift.identify(id, { email })
      }
    }
  })
}