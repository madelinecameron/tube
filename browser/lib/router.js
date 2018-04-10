'use strict'

const landing = require('../views/landing')

module.exports = (app) => {
  app.route('/', landing)
}