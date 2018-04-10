'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const ecstatic = require('ecstatic')
const path = require('path')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const checkForAPIKey = require('./middleware/checkApiKey')
const compression = require('compression')

const app = express()
const router = express.Router()

app.set('port', 3000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(require('express-session')({ secret: 'Ya78ss2FfGnUArFE', resave: true, saveUninitialized: true }));
app.use(passport.initialize())
app.use(passport.session())
app.use(compression())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
})

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
    User.findOne({ email }, function(err, user) {
      if (err) { return done(err) }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' })
      }

      if (user.password === '') {
        return done(null, false, { message: 'Please reset your password'})
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' })
      }

      return done(null, user)
    })
  }
))

passport.serializeUser(function(user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function(id, cb) {
  User.findById(id, function (err, user) {
    if (err) { return cb(err) }
    cb(null, user)
  })
})

router.use('/api', require('./routes/index'))
router.use('/api/days', checkForAPIKey, require('./routes/days'))
router.use('/api/sms', require('./routes/text'))
router.use('/api/mailchimp', require('./routes/mailchimp'))

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