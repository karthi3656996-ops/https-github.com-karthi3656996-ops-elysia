import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiVideoLine,
  RiPhoneLine,
  RiPhoneOffLine,
  RiCameraLine,
  RiCameraOffLine,
  RiMicLine,
  RiMicOffLine,
  RiCopyLine,
  RiLoader4Line,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { socketService } from '../services/socketService'
import { webRTCService } from '../services/webRTCService'
import { useGestureClassifier } from '../hooks/useGestureClassifier'
import { useMediaPipe } from '../hooks/useMediaPipe'
import SubtitleBar from '../components/SubtitleBar'
import { useSentenceBuilder } from '../hooks/useSentenceBuilder'
import { useSettings } from '../hooks/useSettings'

export default function CallPage() {
  const { settings } = useSettings()
  const { classify } = useGestureClassifier()
  const { sentence, currentWord, processGesture, clearSentence, getHoldProgress } = useSentenceBuilder()

  const [roomId, setRoomId] = useState('')
  const [inputRoom, setInputRoom] = useState('')
  const [inCall, setInCall] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [camEnabled, setCamEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [peerId, setPeerId] = useState(null)
  const [peerTranslations, setPeerTranslations] = useState([])
  const [connectionState, setConnectionState] = useState('new')

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const myId = useRef(uuidv4())

  // Gesture recognition for call
  const handleGestureResults = useCallback(({ landmarks }) => {
    if (!landmarks || !inCall) return
    const result = classify(landmarks, settings.confidenceThreshold)
    if (result) {
      processGesture(result.gesture)
      // Broadcast to peer
      if (roomId) {
        socketService.sendTranslation(roomId, result.gesture, myId.current)
      }
    } else {
      processGesture(null)
    }
  }, [classify, inCall, processGesture, roomId, settings.confidenceThreshold])

  const { videoRef: gestureVideoRef, canvasRef: gestureCanvasRef } = useMediaPipe({
    onResults: handleGestureResults,
    enabled: inCall,
  })

  const joinCall = async () => {
    const room = inputRoom.trim() || uuidv4().slice(0, 8).toUpperCase()
    setConnecting(true)

    try {
      // Get local media
      const stream = await webRTCService.getLocalStream(camEnabled, micEnabled)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Connect socket
      const socket = socketService.connect()

      // Setup WebRTC
      webRTCService.createPeerConnection()
      webRTCService.onConnectionStateChange = (state) => {
        setConnectionState(state)
        if (state === 'connected') toast.success('Peer connected!')
        if (state === 'disconnected') toast('Peer disconnected', { icon: '📵' })
      }

      webRTCService.onIceCandidate((candidate) => {
        if (peerId) socketService.sendIceCandidate(room, candidate, peerId)
      })

      webRTCService.webRTCService?.peerConnection?.ontrack && (webRTCService.onRemoteStream = (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
        }
      })

      // Socket events
      socket.on('user-joined', async ({ userId }) => {
        setPeerId(userId)
        toast(`User joined the room!`, { icon: '👋' })
        // Create offer
        const offer = await webRTCService.createOffer()
        socketService.sendOffer(room, offer, userId)
      })

      socket.on('offer', async ({ offer, from }) => {
        setPeerId(from)
        const answer = await webRTCService.createAnswer(offer)
        socketService.sendAnswer(room, answer, from)
      })

      socket.on('answer', async ({ answer }) => {
        await webRTCService.setAnswer(answer)
      })

      socket.on('ice-candidate', async ({ candidate }) => {
        await webRTCService.addIceCandidate(candidate)
      })

      socket.on('peer-translation', ({ text, userId }) => {
        if (userId !== myId.current) {
          setPeerTranslations(prev => [
            { text, time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 19),
          ])
        }
      })

      socket.on('user-left', () => {
        toast('Peer left the call', { icon: '👋' })
        setPeerId(null)
        setConnectionState('disconnected')
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      })

      socketService.joinRoom(room, myId.current)
      setRoomId(room)
      setInCall(true)
      setConnecting(false)
      toast.success(`Joined room: ${room}`)
    } catch (err) {
      setConnecting(false)
      toast.error('Failed to join call: ' + err.message)
    }
  }

  const leaveCall = () => {
    socketService.leaveRoom(roomId)
    socketService.disconnect()
    webRTCService.cleanup()
    setInCall(false)
    setRoomId('')
    setPeerId(null)
    setPeerTranslations([])
    clearSentence()
    setConnectionState('new')
    toast('Left the call', { icon: '📵' })
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    toast.success('Room ID copied!')
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <RiVideoLine size={18} className="text-purple-400" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              Video <span className="text-gradient">Call with Translation</span>
            </h1>
          </div>
          <p className="text-gray-500 ml-12">Real-time sign language translation during video calls</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!inCall ? (
            /* Join Room Screen */
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="glass-card p-8 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                    <RiVideoLine size={28} className="text-purple-400" />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white mb-2">Join a Room</h2>
                  <p className="text-gray-500 text-sm">Enter a Room ID to join an existing call, or leave blank to create a new one.</p>
                </div>

                <div className="space-y-3">
                  <input
                    id="room-id-input"
                    type="text"
                    value={inputRoom}
                    onChange={(e) => setInputRoom(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && joinCall()}
                    placeholder="Room ID (e.g. A1B2C3D4)"
                    className="input-neon text-center font-mono text-lg tracking-widest"
                    maxLength={8}
                  />

                  <div className="flex gap-3">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm flex-1 justify-center ${camEnabled ? 'border-purple-500/30 bg-purple-500/10 text-purple-300' : 'border-white/10 bg-white/5 text-gray-500'}`}
                      onClick={() => setCamEnabled(!camEnabled)}>
                      {camEnabled ? <RiCameraLine size={16} /> : <RiCameraOffLine size={16} />}
                      Camera
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm flex-1 justify-center ${micEnabled ? 'border-purple-500/30 bg-purple-500/10 text-purple-300' : 'border-white/10 bg-white/5 text-gray-500'}`}
                      onClick={() => setMicEnabled(!micEnabled)}>
                      {micEnabled ? <RiMicLine size={16} /> : <RiMicOffLine size={16} />}
                      Mic
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    id="join-call-btn"
                    onClick={joinCall}
                    disabled={connecting}
                    className="btn-neon w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60"
                  >
                    {connecting ? (
                      <>
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <RiLoader4Line size={20} />
                        </motion.span>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <RiPhoneLine size={20} />
                        {inputRoom ? 'Join Room' : 'Create Room'}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* In-Call Screen */
            <motion.div
              key="call"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Room info bar */}
              <div className="glass-card px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${peerId ? 'active' : 'processing'}`} />
                  <span className="text-sm text-gray-300 font-medium">
                    Room: <span className="font-mono text-purple-300">{roomId}</span>
                  </span>
                  <button onClick={copyRoomId} className="text-gray-500 hover:text-gray-300 transition-colors">
                    <RiCopyLine size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {peerId ? 'Connected' : 'Waiting for peer...'}
                  </span>
                  <button
                    id="leave-call-btn"
                    onClick={leaveCall}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-sm font-medium transition-all"
                  >
                    <RiPhoneOffLine size={14} />
                    Leave
                  </button>
                </div>
              </div>

              {/* Video grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Local video */}
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">You</p>
                  <div className="camera-container aspect-video bg-dark-900 rounded-2xl overflow-hidden relative">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    <div className="absolute bottom-2 left-2 text-xs bg-dark-900/70 border border-white/10 rounded-full px-2 py-0.5 text-gray-300">You</div>
                  </div>

                  {/* Gesture canvas (hidden, for AI) */}
                  <div className="relative aspect-video bg-dark-900/50 rounded-xl overflow-hidden border border-white/5">
                    <video ref={gestureVideoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-70" style={{ transform: 'scaleX(-1)' }} />
                    <canvas ref={gestureCanvasRef} className="landmark-canvas" style={{ transform: 'scaleX(-1)' }} />
                    <div className="absolute bottom-2 left-2 text-xs text-gray-500">Gesture AI</div>
                  </div>
                </div>

                {/* Remote video */}
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Peer</p>
                  <div className="camera-container aspect-video bg-dark-900 rounded-2xl overflow-hidden relative">
                    {peerId ? (
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <RiLoader4Line size={28} className="text-gray-600 mb-2 animate-spin" />
                        <p className="text-gray-600 text-sm">Waiting for peer...</p>
                        <p className="text-xs text-gray-700 mt-1">Share room ID: <span className="font-mono">{roomId}</span></p>
                      </div>
                    )}
                  </div>
                  {/* Peer translations */}
                  <div className="glass-card p-3 max-h-40 overflow-y-auto gesture-scroll">
                    <p className="text-xs text-gray-500 mb-2">Peer's gestures:</p>
                    {peerTranslations.length === 0 ? (
                      <p className="text-gray-700 text-xs italic">Waiting for peer translations...</p>
                    ) : (
                      peerTranslations.map((t, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <span className="text-sm text-purple-300">{t.text}</span>
                          <span className="text-xs text-gray-600">{t.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* My translation panel */}
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">My Translation</p>
                  <SubtitleBar
                    sentence={sentence}
                    currentWord={currentWord}
                    holdProgress={getHoldProgress()}
                    onClear={clearSentence}
                  />
                  <div className="glass-card p-3 text-xs text-gray-500">
                    Your gestures are automatically translated and sent to your peer in real-time.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
