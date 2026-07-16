import { useEffect, useRef, useState, useCallback } from 'react'

export function useMediaPipe({ onResults, enabled = true }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const cameraRef = useRef(null)
  const animFrameRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fps, setFps] = useState(0)
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })

  const drawLandmarks = useCallback((canvas, results) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!results.multiHandLandmarks) return

    for (const landmarks of results.multiHandLandmarks) {
      // Draw connections
      const connections = window.HAND_CONNECTIONS
      if (connections) {
        for (const [start, end] of connections) {
          const s = landmarks[start]
          const e = landmarks[end]
          ctx.beginPath()
          ctx.moveTo(s.x * canvas.width, s.y * canvas.height)
          ctx.lineTo(e.x * canvas.width, e.y * canvas.height)
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // Draw landmarks
      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i]
        const x = lm.x * canvas.width
        const y = lm.y * canvas.height

        // Fingertips glow bigger
        const isTip = [4, 8, 12, 16, 20].includes(i)
        const radius = isTip ? 6 : 4

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        
        if (isTip) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2)
          gradient.addColorStop(0, 'rgba(192, 132, 252, 1)')
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')
          ctx.fillStyle = gradient
          ctx.arc(x, y, radius * 2, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
          ctx.fillStyle = '#C084FC'
        } else {
          ctx.fillStyle = '#A855F7'
        }
        ctx.fill()

        // White center dot
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill()
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    let mounted = true

    const initMediaPipe = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load MediaPipe via CDN scripts if not already loaded
        await loadMediaPipeScripts()

        if (!mounted) return

        const hands = new window.Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        })

        hands.onResults((results) => {
          if (!mounted) return

          // FPS counter
          const now = Date.now()
          fpsCounterRef.current.frames++
          if (now - fpsCounterRef.current.lastTime >= 1000) {
            setFps(fpsCounterRef.current.frames)
            fpsCounterRef.current = { frames: 0, lastTime: now }
          }

          // Draw landmarks
          if (canvasRef.current) {
            drawLandmarks(canvasRef.current, results)
          }

          // Pass results to parent
          if (onResults) {
            const landmarks = results.multiHandLandmarks?.[0] || null
            onResults({ landmarks, results })
          }
        })

        handsRef.current = hands

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        })

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth
              canvasRef.current.height = videoRef.current.videoHeight
            }

            const processFrame = async () => {
              if (!mounted) return
              if (videoRef.current && videoRef.current.readyState >= 2 && handsRef.current) {
                await handsRef.current.send({ image: videoRef.current })
              }
              animFrameRef.current = requestAnimationFrame(processFrame)
            }

            setIsLoading(false)
            processFrame()
          }
        }

        cameraRef.current = stream
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Failed to initialize camera')
        setIsLoading(false)
      }
    }

    initMediaPipe()

    return () => {
      mounted = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (cameraRef.current) cameraRef.current.getTracks().forEach(t => t.stop())
      if (handsRef.current) handsRef.current.close?.()
    }
  }, [enabled, drawLandmarks, onResults])

  return { videoRef, canvasRef, isLoading, error, fps }
}

// Dynamically load MediaPipe scripts from CDN
async function loadMediaPipeScripts() {
  const scripts = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  ]

  for (const src of scripts) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
  }

  // Wait for Hands to be available
  let attempts = 0
  while (!window.Hands && attempts < 50) {
    await new Promise(r => setTimeout(r, 100))
    attempts++
  }

  if (!window.Hands) throw new Error('MediaPipe Hands failed to load')
}
