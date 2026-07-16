require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const gestureRoutes = require('./routes/gestures')
const { registerSocketHandlers } = require('./sockets/socketHandlers')

const app = express()
const server = http.createServer(app)

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Elysia Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// API Routes
app.use('/api/gestures', gestureRoutes)

// Socket.IO handlers
registerSocketHandlers(io)

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/elysia'

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.warn('⚠️  MongoDB not connected:', err.message)
    console.warn('   App will still work — gesture data stored client-side')
  })

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`\n🚀 Elysia Backend running at http://localhost:${PORT}`)
  console.log(`   Socket.IO ready for real-time connections`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})
