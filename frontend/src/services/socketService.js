import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect() {
    if (this.socket?.connected) return this.socket

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => { this.connected = true })
    this.socket.on('disconnect', () => { this.connected = false })

    return this.socket
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
    this.connected = false
  }

  joinRoom(roomId, userId) {
    this.socket?.emit('join-room', { roomId, userId })
  }

  leaveRoom(roomId) {
    this.socket?.emit('leave-room', { roomId })
  }

  sendTranslation(roomId, text, userId) {
    this.socket?.emit('translation', { roomId, text, userId, timestamp: Date.now() })
  }

  sendOffer(roomId, offer, targetId) {
    this.socket?.emit('offer', { roomId, offer, targetId })
  }

  sendAnswer(roomId, answer, targetId) {
    this.socket?.emit('answer', { roomId, answer, targetId })
  }

  sendIceCandidate(roomId, candidate, targetId) {
    this.socket?.emit('ice-candidate', { roomId, candidate, targetId })
  }

  on(event, handler) {
    this.socket?.on(event, handler)
  }

  off(event, handler) {
    this.socket?.off(event, handler)
  }

  getSocket() {
    return this.socket
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
