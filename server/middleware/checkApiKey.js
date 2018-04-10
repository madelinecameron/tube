'use strict'

const mongoose = require('mongoose')
const config = require('../config')
const User = require('../models/User')

mongoose.connect(process.env.MONGO_URL, { useMongoClient: true })

module.exports =  (req, res, next) => {
  const apiKey = req.header('x-apikey')
  console.info(`Checking for API key`)
  if (!apiKey) {
    console.info(`Couldn't find API key for request`)
    return res.sendStatus(401)
  } else {
    User.findOne({ apiKey: apiKey }, (err, user) => {
      if (err) {
        console.error(`Error while checking API key: `, err)
        return res.sendStatus(500)
      }

      if (user) {
        console.info(`Found user with API key`)
        if (!req.user) {
          req.user = user
        }
        return next()
      } else {
        console.info(`Couldn't match API key with user`)
        return res.sendStatus(401)
      }
    })
  }
}