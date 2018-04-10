'use strict'

const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  phoneNumber: String
})

const UserSchema = new mongoose.Schema({
  password: String,
  email: String,
  phoneNumber: String,
  profile: mongoose.Schema.Types.Mixed,
  resetToken: mongoose.Schema.Types.ObjectId
})

const User = mongoose.model('User', UserSchema)

module.exports = User