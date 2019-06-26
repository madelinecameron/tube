'use strict'

const landing = require('../views/landing')
const watch = require('../views/watch')

module.exports = (app) => {
  app.route('/', landing)
  app.route('/watch', watch)
}