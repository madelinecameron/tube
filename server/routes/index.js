'use strict'

const mongoose = require('mongoose')
const express = require('express')
const youtubeSearch = require('youtube-search')
const cloudinary = require('cloudinary')

const router = express.Router()

router.get('/search', (req, res, next) => {
  console.log("BLEH:", req.query)

  const opts = {
    maxResults: 5,
    key: 'AIzaSyA4xtLA0hDWOMYNl7VVFNGqb0FOWZdC1QE'
  }

  youtubeSearch(req.query.term, opts, (err, results) => {
    if (err) return console.log(err)
   
    const promises = results.map(async (video) => {
      return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(video.thumbnails.high.url, 
          { 
            eager: [{
              width: 300,
              height: 168,
              crop: "limit"
            }, {
              width: 300, height: 168, crop: 'pad', background: "black"
            }],
            tags: [ video.id ],
            public_id: video.id
          }, (err, result) => { 
            console.log("ERR:", err, result)
            return resolve(result.eager[1].url)
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
