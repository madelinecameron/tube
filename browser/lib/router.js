'use strict'

const playlist = require('../views/playlist')
const landing = require('../views/landing')
const watch = require('../views/watch')

module.exports = (app) => {
  app.route('/', landing)
  app.route('/watch', watch)
  app.route('/playlist', playlist)
}