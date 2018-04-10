'use strict'

const choo = require('choo')

const app = choo()

require('./lib/router')(app)
require('./lib/global')(app)
require('./lib/drift')(app)
require('./lib/mixpanel')(app)

document.body.appendChild(app.start())
