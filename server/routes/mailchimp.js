'use strict'

const mongoose = require('mongoose')
const express = require('express')
const request = require('superagent')
const User = require('../models/User')
const Mailchimp = require('mailchimp-api-v3')

const mailchimp = new Mailchimp('3abe332891e286d0a00146e6557e7dcb-us13')

const router = express.Router()

router.post('/', (req, res, next) => {
  console.log("JOIN LIST")
  mailchimp.post({
    path: '/lists/9206398e9a/members',
    body: {
      email_address: req.body.email,
      status: 'subscribed'
    }
  })
  .then(() => {
    console.log("SUCCESS!")

    return res.send(201).end()
  })
  .catch((err) => {
    console.log("ERROR:", err)

    return res.send(500).end()
  })
})

module.exports = router