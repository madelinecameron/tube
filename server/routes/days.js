'use strict'

const mongoose = require('mongoose')
const moment = require('moment')
const express = require('express')
const request = require('superagent')
const passport = require('passport')
const LocalStrat = require('passport-local').Strategy
const User = require('../models/User')
const Day = require('../models/Day')
const fs = require('fs')

mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });

const router = express.Router()

/**
 * @api {get} /api/days Get a list of your days
 * @apiName Get
 * @apiGroup Days
 *
 * @apiSuccess {Array[Days]} Collection of your days
 */

router.get('/', (req, res, next) => {
  console.log(`Finding days for ${req.user._id.toString()}`)
  Day.find({ userId: req.user._id }, (err, days) => {
    if (err) {
      console.error(`Error occurred retrieving days for ${req.user.email}`, { err })
      return res.sendStatus(500)
    }

    console.log(`Sending days for ${req.user.email}, len: ${days.length}`)
    return res.json(days)
  })
})

// router.get('/:id', (req, res, next) => {
//   Day.findOne({ ownerId: req.user._id }, (err, pantry) => {
//     if (err) {}

//     const items = pantry.items.filter(item => {
//       return item._id == req.params.id
//     })

//     return res.json(items[0])
//   })
// })

router.post('/', (req, res, next) => {
  if (Object.keys(req.body).indexOf('answer') === -1) {
    console.error(`Received request to add day w/o an answer!`, { email: req.user.email })
    return res.sendStatus(400)
  }

  Day.create({ answer: req.body.answer, date: new Date(), userId: req.user._id, reason: req.body.reason }, (err, day) => {
    if (err) {
      console.error(`Error occurred creating day for ${req.user.email}`, { err })
      return res.sendStatus(500)
    }

    console.log(`Saved day answer for ${req.user.email}`)
    return res.json(day)
  })
})

module.exports = router