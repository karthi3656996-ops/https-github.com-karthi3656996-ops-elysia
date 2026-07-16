const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

class WebRTCService {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.onRemoteStream = null
    this.onConnectionStateChange = null
  }

  async getLocalStream(videoEnabled = true, audioEnabled = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? { width: 640, height: 480 } : false,
        audio: audioEnabled,
      })
      return this.localStream
    } catch (err) {
      console.error('Failed to get local stream:', err)
      throw err
    }
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }

    // Remote stream
    this.remoteStream = new MediaStream()
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track)
      })
      this.onRemoteStream?.(this.remoteStream)
    }

    this.peerConnection.onconnectionstatechange = () => {
      this.onConnectionStateChange?.(this.peerConnection.connectionState)
    }

    return this.peerConnection
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(offer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async setAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  }

  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (err) {
      console.warn('ICE candidate error:', err)
    }
  }

  onIceCandidate(callback) {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) callback(event.candidate)
      }
    }
  }

  cleanup() {
    this.localStream?.getTracks().forEach(t => t.stop())
    this.peerConnection?.close()
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
  }
}

export const webRTCService = new WebRTCService()
