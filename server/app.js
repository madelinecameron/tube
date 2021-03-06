'use strict'

const compression = require('compression')
const bodyParser = require('body-parser')
const ecstatic = require('ecstatic')
const express = require('express')
const path = require('path')

const app = express()
const router = express.Router()

app.use(bodyParser.json())
app.use(compression())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
})

router.use('/api', require('./routes/index'))

app.use(router)

app.use(ecstatic({ 
  root: __dirname + '/../public',
  gzip: true,
  cache: 'max-age=86400'
}))

// All other routes
router.use('*', (req, res, next) => {
  if (req.baseUrl.indexOf('.') > -1) {
    return next()
  }

  // What routes to respond with index.html with
  const publicRoutes = [
    new RegExp('/watch')
  ]

  const match = publicRoutes.some(route => {
    return route.test(req.baseUrl)
  })

  if (match) {
    return res.sendFile(path.join(__dirname, '../public', 'index.html'))
  } else {
    return next()
  }
})

app.use((err, req, res, next) => {
  if (err) {
    console.error('Error occurred: ', err)
    res.statusCode = 500
    return res.send(err)
  }

  res.end()
  return next()
})

module.exports = app