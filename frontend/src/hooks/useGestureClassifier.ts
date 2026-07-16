import { useState, useEffect, useRef, useCallback } from 'react'
import type { Landmark, GestureResult, GestureStat, TrainingSample } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Finger landmark indices (MediaPipe Hands)
// ─────────────────────────────────────────────────────────────────────────────

const FINGER_TIPS = [4, 8, 12, 16, 20]
const FINGER_PIPS = [3, 7, 11, 15, 19]

function getFingersExtended(landmarks: Landmark[]): number[] {
  if (!landmarks || landmarks.length < 21) return [0, 0, 0, 0, 0]
  const fingers: number[] = []

  // Thumb: orientation-aware x comparison
  const isRightHand = landmarks[0].x < landmarks[9].x
  fingers.push(isRightHand ? (landmarks[4].x < landmarks[3].x ? 1 : 0) : (landmarks[4].x > landmarks[3].x ? 1 : 0))

  // Other 4 fingers: tip y < pip y = extended
  for (let i = 1; i < 5; i++) {
    fingers.push(landmarks[FINGER_TIPS[i]].y < landmarks[FINGER_PIPS[i]].y ? 1 : 0)
  }

  return fingers
}

function normalizeLandmarks(landmarks: Landmark[]): Landmark[] | null {
  if (!landmarks || landmarks.length < 21) return null
  const wrist = landmarks[0]
  const palmSize =
    Math.sqrt(
      Math.pow(landmarks[9].x - wrist.x, 2) + Math.pow(landmarks[9].y - wrist.y, 2),
    ) || 1
  return landmarks.map((lm) => ({
    x: (lm.x - wrist.x) / palmSize,
    y: (lm.y - wrist.y) / palmSize,
    z: (lm.z - wrist.z) / palmSize,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Rule-based ASL classifier
// ─────────────────────────────────────────────────────────────────────────────

function classifyASL(landmarks: Landmark[]): GestureResult | null {
  const f = getFingersExtended(landmarks)
  const [thumb, index, middle, ring, pinky] = f
  const count = f.reduce((a, b) => a + b, 0)

  if (thumb && index && !middle && !ring && pinky) return { gesture: 'I Love You', confidence: 0.92 }
  if (thumb && !index && !middle && !ring && pinky) return { gesture: 'Y', confidence: 0.88 }
  if (thumb && index && !middle && !ring && !pinky) return { gesture: 'L', confidence: 0.85 }
  if (count === 5) return { gesture: 'Hello', confidence: 0.90 }
  if (count === 0) return { gesture: 'A', confidence: 0.82 }
  if (!thumb && index && !middle && !ring && !pinky) return { gesture: 'Point / 1', confidence: 0.87 }
  if (!thumb && index && middle && !ring && !pinky) return { gesture: 'Peace / 2', confidence: 0.88 }
  if (!thumb && index && middle && ring && !pinky) return { gesture: 'Thank You', confidence: 0.82 }
  if (!thumb && index && middle && ring && pinky) return { gesture: '4', confidence: 0.83 }
  if (thumb && index && middle && !ring && !pinky) return { gesture: 'Help', confidence: 0.75 }
  if (!thumb && !index && !middle && !ring && pinky) return { gesture: 'Please', confidence: 0.78 }
  if (thumb && !index && !middle && !ring && !pinky) {
    const isThumbUp = landmarks[4].y < landmarks[2].y
    return isThumbUp
      ? { gesture: 'Yes / Good', confidence: 0.85 }
      : { gesture: 'No / Bad', confidence: 0.84 }
  }
  if (!thumb && index && !middle && !ring && pinky) return { gesture: 'Stop', confidence: 0.80 }
  if (count === 2 && thumb && index) return { gesture: 'Water', confidence: 0.76 }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// KNN classifier for custom trained gestures
// ─────────────────────────────────────────────────────────────────────────────

function knnClassify(
  normalizedLandmarks: Landmark[],
  trainingData: TrainingSample[],
  k = 3,
): GestureResult | null {
  if (!trainingData.length || !normalizedLandmarks) return null

  const query = normalizedLandmarks.flatMap((lm) => [lm.x, lm.y, lm.z])
  const distances = trainingData.map((sample) => {
    const vec = sample.landmarks.flatMap((lm) => [lm.x, lm.y, lm.z])
    const dist = Math.sqrt(vec.reduce((sum, val, i) => sum + Math.pow(val - (query[i] ?? 0), 2), 0))
    return { label: sample.label, dist }
  })

  distances.sort((a, b) => a.dist - b.dist)
  const topK = distances.slice(0, Math.min(k, distances.length))

  const votes: Record<string, number> = {}
  topK.forEach(({ label, dist }) => {
    const weight = 1 / (dist + 0.001)
    votes[label] = (votes[label] ?? 0) + weight
  })

  const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]
  if (!winner) return null

  const totalWeight = Object.values(votes).reduce((a, b) => a + b, 0)
  const confidence = winner[1] / totalWeight
  return { gesture: winner[0], confidence: Math.min(confidence, 0.99) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

const SMOOTHING_FRAMES = 10

interface UseGestureClassifierReturn {
  classify: (landmarks: Landmark[], threshold?: number) => GestureResult | null
  addTrainingSample: (label: string, landmarks: Landmark[]) => void
  deleteGesture: (label: string) => void
  getGestureStats: () => GestureStat[]
  exportModel: () => void
  importModel: (jsonData: string) => boolean
  clearModel: () => void
  trainingData: TrainingSample[]
  trainingCount: number
}

export function useGestureClassifier(): UseGestureClassifierReturn {
  const [trainingData, setTrainingData] = useState<TrainingSample[]>(() => {
    try {
      const saved = localStorage.getItem('elysia-training-data')
      return saved ? (JSON.parse(saved) as TrainingSample[]) : []
    } catch {
      return []
    }
  })

  const smoothingBuffer = useRef<string[]>([])

  useEffect(() => {
    localStorage.setItem('elysia-training-data', JSON.stringify(trainingData))
  }, [trainingData])

  const classify = useCallback(
    (landmarks: Landmark[], confidenceThreshold = 0.75): GestureResult | null => {
      if (!landmarks?.length) return null

      const normalized = normalizeLandmarks(landmarks)
      if (!normalized) return null

      let result = knnClassify(normalized, trainingData)

      if (!result || result.confidence < confidenceThreshold) {
        const aslResult = classifyASL(landmarks)
        result = aslResult && aslResult.confidence >= confidenceThreshold ? aslResult : null
      }

      if (!result) {
        smoothingBuffer.current = []
        return null
      }

      smoothingBuffer.current.push(result.gesture)
      if (smoothingBuffer.current.length > SMOOTHING_FRAMES) {
        smoothingBuffer.current.shift()
      }

      // Majority vote
      const votes: Record<string, number> = {}
      smoothingBuffer.current.forEach((g) => { votes[g] = (votes[g] ?? 0) + 1 })
      const top = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]
      if (top && top[1] >= Math.ceil(SMOOTHING_FRAMES * 0.5)) {
        return { gesture: top[0], confidence: result.confidence, normalized }
      }

      return null
    },
    [trainingData],
  )

  const addTrainingSample = useCallback((label: string, landmarks: Landmark[]) => {
    const normalized = normalizeLandmarks(landmarks)
    if (!normalized) return
    setTrainingData((prev) => [...prev, { label, landmarks: normalized, timestamp: Date.now() }])
  }, [])

  const deleteGesture = useCallback((label: string) => {
    setTrainingData((prev) => prev.filter((s) => s.label !== label))
  }, [])

  const getGestureStats = useCallback((): GestureStat[] => {
    const stats: Record<string, number> = {}
    trainingData.forEach(({ label }) => { stats[label] = (stats[label] ?? 0) + 1 })
    return Object.entries(stats).map(([name, count]) => ({ name, count }))
  }, [trainingData])

  const exportModel = useCallback(() => {
    const data = JSON.stringify({ trainingData, exportedAt: new Date().toISOString(), version: '1.0' })
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'elysia-gesture-model.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [trainingData])

  const importModel = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData) as { trainingData?: TrainingSample[] }
      if (parsed.trainingData) {
        setTrainingData(parsed.trainingData)
        return true
      }
    } catch {
      return false
    }
    return false
  }, [])

  const clearModel = useCallback(() => setTrainingData([]), [])

  return {
    classify,
    addTrainingSample,
    deleteGesture,
    getGestureStats,
    exportModel,
    importModel,
    clearModel,
    trainingData,
    trainingCount: trainingData.length,
  }
}

export { normalizeLandmarks }
