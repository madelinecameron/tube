'use strict'

module.exports = (app) => {
  app.use((state, emitter) => {
    state.mixpanel = {
      track: (eventName) => {
        window.mixpanel.track(eventName)
      },
      identify: (id) => {
        console.log("IDENTIFY:", id)
        window.mixpanel.identify(id)
      },
      createIdentity: (user) => {
        window.mixpanel.people.set({
          $email: user.email,
          $created: user.created_at,
          $last_login: new Date(),
          pantries: 1,
          pantryItems: 0
        })
      }
    }
  })
}