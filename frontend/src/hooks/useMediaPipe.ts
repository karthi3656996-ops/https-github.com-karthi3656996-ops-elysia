import { useState, useEffect, useRef, useCallback } from 'react'
import type { Landmark, MediaPipeResults } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Extend window for MediaPipe CDN globals
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Hands: new (config: { locateFile: (file: string) => string }) => MediaPipeHands
    HAND_CONNECTIONS: Array<[number, number]>
  }
}

interface MediaPipeHands {
  setOptions: (options: {
    maxNumHands?: number
    modelComplexity?: number
    minDetectionConfidence?: number
    minTrackingConfidence?: number
  }) => void
  onResults: (callback: (results: MediaPipeResults) => void) => void
  send: (input: { image: HTMLVideoElement }) => Promise<void>
  close?: () => void
}

interface UseMediaPipeOptions {
  onResults?: (payload: { landmarks: Landmark[] | null; results: MediaPipeResults }) => void
  enabled?: boolean
}

interface UseMediaPipeReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  isLoading: boolean
  error: string | null
  fps: number
}

// ─────────────────────────────────────────────────────────────────────────────

export function useMediaPipe({ onResults, enabled = true }: UseMediaPipeOptions): UseMediaPipeReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<MediaPipeHands | null>(null)
  const cameraRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })

  const drawLandmarks = useCallback((canvas: HTMLCanvasElement, results: MediaPipeResults) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
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
        const isTip = [4, 8, 12, 16, 20].includes(i)
        const radius = isTip ? 6 : 4

        if (isTip) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2)
          gradient.addColorStop(0, 'rgba(192, 132, 252, 1)')
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')
          ctx.beginPath()
          ctx.arc(x, y, radius * 2, 0, 2 * Math.PI)
          ctx.fillStyle = gradient
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
          ctx.fillStyle = '#C084FC'
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
          ctx.fillStyle = '#A855F7'
          ctx.fill()
        }

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

        await loadMediaPipeScripts()
        if (!mounted) return

        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
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

          if (canvasRef.current) drawLandmarks(canvasRef.current, results)

          if (onResults) {
            const landmarks = results.multiHandLandmarks?.[0] ?? null
            onResults({ landmarks, results })
          }
        })

        handsRef.current = hands

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        })

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        cameraRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (!videoRef.current) return
            videoRef.current.play()
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth
              canvasRef.current.height = videoRef.current.videoHeight
            }

            const processFrame = async () => {
              if (!mounted) return
              if (videoRef.current?.readyState >= 2 && handsRef.current) {
                await handsRef.current.send({ image: videoRef.current })
              }
              animFrameRef.current = requestAnimationFrame(processFrame)
            }

            setIsLoading(false)
            processFrame()
          }
        }
      } catch (err) {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : 'Failed to initialize camera'
        setError(msg)
        setIsLoading(false)
      }
    }

    initMediaPipe()

    return () => {
      mounted = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      cameraRef.current?.getTracks().forEach((t) => t.stop())
      handsRef.current?.close?.()
    }
  }, [enabled, drawLandmarks, onResults])

  return { videoRef, canvasRef, isLoading, error, fps }
}

// ─────────────────────────────────────────────────────────────────────────────
// Load MediaPipe scripts from CDN dynamically
// ─────────────────────────────────────────────────────────────────────────────

async function loadMediaPipeScripts(): Promise<void> {
  const scripts = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  ]

  for (const src of scripts) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load: ${src}`))
        document.head.appendChild(script)
      })
    }
  }

  // Wait for Hands to be available on window
  let attempts = 0
  while (!window.Hands && attempts < 50) {
    await new Promise((r) => setTimeout(r, 100))
    attempts++
  }
  if (!window.Hands) throw new Error('MediaPipe Hands failed to load from CDN')
}
