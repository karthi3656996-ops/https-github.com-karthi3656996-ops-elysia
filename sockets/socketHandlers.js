const rooms = new Map() // roomId → Set of socket IDs

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    socket.on('join-room', ({ roomId, userId }) => {
      socket.join(roomId)
      socket.data.roomId = roomId
      socket.data.userId = userId

      if (!rooms.has(roomId)) rooms.set(roomId, new Set())
      rooms.get(roomId).add(socket.id)

      // Notify other users in room
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id })
      console.log(`👤 ${userId} joined room ${roomId}`)
    })

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId)
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id)
        if (rooms.get(roomId).size === 0) rooms.delete(roomId)
      }
      socket.to(roomId).emit('user-left', { socketId: socket.id })
    })

    // WebRTC signaling
    socket.on('offer', ({ roomId, offer, targetId }) => {
      socket.to(roomId).emit('offer', { offer, from: socket.data.userId })
    })

    socket.on('answer', ({ roomId, answer, targetId }) => {
      socket.to(roomId).emit('answer', { answer, from: socket.data.userId })
    })

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate, from: socket.data.userId })
    })

    // Translation broadcast
    socket.on('translation', ({ roomId, text, userId }) => {
      socket.to(roomId).emit('peer-translation', { text, userId })
    })

    socket.on('disconnect', () => {
      const { roomId, userId } = socket.data
      if (roomId) {
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id)
          if (rooms.get(roomId).size === 0) rooms.delete(roomId)
        }
        socket.to(roomId).emit('user-left', { socketId: socket.id, userId })
      }
      console.log(`❌ Socket disconnected: ${socket.id}`)
    })
  })
}

module.exports = { registerSocketHandlers }
