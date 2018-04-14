'use strict'

const mongoose = require('mongoose')
const express = require('express')
const youtubeSearch = require('youtube-search')
const cloudinary = require('cloudinary')

const router = express.Router()

router.get('/search', (req, res, next) => {

  const opts = {
    maxResults: 10,
    key: process.env.GOOGLE_API_KEY
  }

  youtubeSearch(req.query.term, opts, (err, results) => {
    if (err) return console.log(err)

    results = results.filter(vid => vid.id.length <= 11)

    const videos = results.map((video, index) => {
      video.thumbnail = video.thumbnails.medium.url

      return video
    })

    return res.json(videos)
  })
})

module.exports = router
