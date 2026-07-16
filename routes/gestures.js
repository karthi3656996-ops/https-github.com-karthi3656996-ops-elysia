const express = require('express')
const router = express.Router()
const Gesture = require('../models/Gesture')
const mongoose = require('mongoose')

const dbReady = () => mongoose.connection.readyState === 1

// GET all gestures
router.get('/', async (req, res) => {
  if (!dbReady()) return res.json([])
  try {
    const gestures = await Gesture.find().sort({ createdAt: -1 })
    res.json(gestures)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create gesture
router.post('/', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'DB not available' })
  try {
    const gesture = new Gesture(req.body)
    const saved = await gesture.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT update gesture
router.put('/:id', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'DB not available' })
  try {
    const updated = await Gesture.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE gesture
router.delete('/:id', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'DB not available' })
  try {
    await Gesture.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST import model
router.post('/import', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'DB not available' })
  try {
    const { trainingData } = req.body
    if (!trainingData) return res.status(400).json({ message: 'No training data' })
    const docs = trainingData.map(d => ({ name: d.label, landmarks: d.landmarks }))
    await Gesture.insertMany(docs)
    res.json({ message: `Imported ${docs.length} gestures` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
