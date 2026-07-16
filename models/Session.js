const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  participants: [{
    userId: String,
    joinedAt: Date,
    leftAt: Date,
  }],
  translations: [{
    userId: String,
    text: String,
    timestamp: Date,
  }],
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Session', sessionSchema)
