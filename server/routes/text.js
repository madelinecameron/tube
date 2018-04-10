'use strict'

const ACCOUNT_SID = process.env.TWILIO_ACCT
const AUTH_TOKEN = process.env.TWILIO_TOKEN

const mongoose = require('mongoose')
const express = require('express')
const request = require('superagent')
const twilio = require('twilio')
const User = require('../models/User')
const Day = require('../models/Day')
const Mixpanel = require('mixpanel')
 
const mixpanel = Mixpanel.init(process.env.MIXPANEL_KEY)

const client = new twilio(ACCOUNT_SID, AUTH_TOKEN)

mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });

const router = express.Router()

router.post('/', (req, res, next) => {
  User.findOne({ 
    $or: [
      { 'profile.phoneNum': req.body.From },
      { 'profile.phoneNum': req.body.From.slice(-11) },
      { 'profile.phoneNum': req.body.From.slice(-12) },
      { 'profile.phoneNum': req.body.From.slice(-13) }
    ]
  }, (err, user) => {
    if (err) {
      return res.sendStatus(500)
    }

    if (user) {
      const answer = req.body.Body.toLowerCase().split('.')[0]
      const reason = req.body.Body

      Day.create({
        userId: user._id,
        reason,
        answer,
        date: new Date()
      }, (err, day) => {
        if (err) {
          return res.sendStatus(500)
        }

        mixpanel.track('day:save:text')

        // const twiml = new twilio.twiml.MessagingResponse()

        // twiml.message()
        res.writeHead(200, { 'Content-Type': 'text/xml' })
        res.end()
      })
    }
  })
})

module.exports = router