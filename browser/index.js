'use strict'

const choo = require('choo')

const app = choo()

require('./lib/router')(app)

document.body.appendChild(app.start())
