const mongoose = require('mongoose')

const gestureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  landmarks: [{
    x: Number,
    y: Number,
    z: Number,
  }],
  sampleCount: {
    type: Number,
    default: 1,
  },
  userId: {
    type: String,
    default: 'anonymous',
  },
  tags: [String],
  isBuiltin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Gesture', gestureSchema)
