'use strict'

const mongoose = require('mongoose')

const DaySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  answer: String,
  reason: String,
  date: Date
})

const Day = mongoose.model('Day', DaySchema)

module.exports = Day