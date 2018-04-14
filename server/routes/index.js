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
   
    const promises = results.map(async (video) => {
      return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(video.thumbnails.high.url, 
          { 
            eager: [{
              width: 300, height: 168, crop: 'lfill', background: "black", gravity: 'center'
            }],
            tags: [ video.id ],
            public_id: video.id
          }, (err, result) => { 
            return resolve(result.eager[0].secure_url)
          })
      })
    })

    Promise.all(promises)
      .then((urls) => {
        const videos = results.map((video, index) => {
          video.thumbnail = urls[index]

          return video
        })

        return res.json(videos)
      })
  })
})

module.exports = router
