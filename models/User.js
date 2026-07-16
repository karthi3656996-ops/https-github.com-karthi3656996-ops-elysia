const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  passwordHash: String,
  preferences: {
    theme: { type: String, default: 'dark' },
    voiceEnabled: { type: Boolean, default: true },
    voiceRate: { type: Number, default: 1 },
    voicePitch: { type: Number, default: 1 },
    language: { type: String, default: 'en-US' },
  },
  gestureModelRef: String, // S3 or local path to exported model
}, {
  timestamps: true,
})

module.exports = mongoose.model('User', userSchema)
