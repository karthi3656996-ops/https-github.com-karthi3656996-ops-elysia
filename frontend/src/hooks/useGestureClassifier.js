import { useState, useEffect, useRef, useCallback } from 'react'

// Finger tip and pip indices from MediaPipe Hands
const FINGER_TIPS = [4, 8, 12, 16, 20]
const FINGER_PIPS = [3, 7, 11, 15, 19]
const FINGER_MCPS = [2, 6, 10, 14, 18]

/**
 * Returns which fingers are extended (1 = up, 0 = down)
 * Index: [thumb, index, middle, ring, pinky]
 */
function getFingersExtended(landmarks) {
  if (!landmarks || landmarks.length < 21) return [0, 0, 0, 0, 0]
  
  const fingers = []
  
  // Thumb: compare tip x to ip x (hand orientation aware)
  const isRightHand = landmarks[0].x < landmarks[9].x
  if (isRightHand) {
    fingers.push(landmarks[4].x < landmarks[3].x ? 1 : 0)
  } else {
    fingers.push(landmarks[4].x > landmarks[3].x ? 1 : 0)
  }
  
  // Other 4 fingers: tip y < pip y means extended (higher on screen = lower y)
  for (let i = 1; i < 5; i++) {
    fingers.push(landmarks[FINGER_TIPS[i]].y < landmarks[FINGER_PIPS[i]].y ? 1 : 0)
  }
  
  return fingers
}

/**
 * Compute angle between three points (in degrees)
 */
function angleBetween(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const cross = ab.x * cb.y - ab.y * cb.x
  return Math.abs(Math.atan2(cross, dot) * (180 / Math.PI))
}

/**
 * Normalize landmarks to be wrist-relative and scale-invariant
 */
function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) return null
  const wrist = landmarks[0]
  const palmSize = Math.sqrt(
    Math.pow(landmarks[9].x - wrist.x, 2) + Math.pow(landmarks[9].y - wrist.y, 2)
  ) || 1

  return landmarks.map(lm => ({
    x: (lm.x - wrist.x) / palmSize,
    y: (lm.y - wrist.y) / palmSize,
    z: (lm.z - wrist.z) / palmSize,
  }))
}

/**
 * Rule-based ASL classifier using finger states and angles
 */
function classifyASL(landmarks) {
  const f = getFingersExtended(landmarks)
  const [thumb, index, middle, ring, pinky] = f
  const count = f.reduce((a, b) => a + b, 0)

  // "I Love You" - thumb + index + pinky up
  if (thumb && index && !middle && !ring && pinky) return { gesture: 'I Love You', confidence: 0.92 }

  // "Y" - thumb + pinky only
  if (thumb && !index && !middle && !ring && pinky) return { gesture: 'Y', confidence: 0.88 }

  // "D" - index + middle + ring + pinky curved, thumb out
  if (thumb && index && !middle && !ring && !pinky) return { gesture: 'L', confidence: 0.85 }

  // All fingers up = "5" / "Hello"  
  if (count === 5) return { gesture: 'Hello', confidence: 0.90 }

  // Fist = "A"
  if (count === 0) return { gesture: 'A', confidence: 0.82 }

  // Index only = "1" / pointing
  if (!thumb && index && !middle && !ring && !pinky) return { gesture: 'Point / 1', confidence: 0.87 }

  // Index + Middle = "2" / Peace / Victory
  if (!thumb && index && middle && !ring && !pinky) return { gesture: 'Peace / 2', confidence: 0.88 }

  // Index + Middle + Ring = "3"
  if (!thumb && index && middle && ring && !pinky) return { gesture: 'Thank You', confidence: 0.82 }

  // Index + Middle + Ring + Pinky (no thumb) = "4"
  if (!thumb && index && middle && ring && pinky) return { gesture: '4', confidence: 0.83 }

  // Thumb + Index + Middle = OK-ish
  if (thumb && index && middle && !ring && !pinky) return { gesture: 'Help', confidence: 0.75 }

  // Pinky only
  if (!thumb && !index && !middle && !ring && pinky) return { gesture: 'Please', confidence: 0.78 }

  // Thumb only
  if (thumb && !index && !middle && !ring && !pinky) {
    // Check if thumb is up or down based on y position vs wrist
    const isThumbUp = landmarks[4].y < landmarks[2].y
    return isThumbUp
      ? { gesture: 'Yes / Good', confidence: 0.85 }
      : { gesture: 'No / Bad', confidence: 0.84 }
  }

  // Index + pinky (horns)
  if (!thumb && index && !middle && !ring && pinky) return { gesture: 'Stop', confidence: 0.80 }

  // Closed index pointing down
  if (count === 2 && thumb && index) return { gesture: 'Water', confidence: 0.76 }

  return null
}

/**
 * KNN classifier for custom trained gestures
 */
function knnClassify(normalizedLandmarks, trainingData, k = 3) {
  if (!trainingData || trainingData.length === 0) return null
  if (!normalizedLandmarks) return null

  const query = normalizedLandmarks.flatMap(lm => [lm.x, lm.y, lm.z])

  const distances = trainingData.map(sample => {
    const vec = sample.landmarks.flatMap(lm => [lm.x, lm.y, lm.z])
    const dist = Math.sqrt(vec.reduce((sum, val, i) => sum + Math.pow(val - (query[i] || 0), 2), 0))
    return { label: sample.label, dist }
  })

  distances.sort((a, b) => a.dist - b.dist)
  const topK = distances.slice(0, Math.min(k, distances.length))

  // Vote
  const votes = {}
  topK.forEach(({ label, dist }) => {
    const weight = 1 / (dist + 0.001)
    votes[label] = (votes[label] || 0) + weight
  })

  const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]
  if (!winner) return null

  const totalWeight = Object.values(votes).reduce((a, b) => a + b, 0)
  const confidence = winner[1] / totalWeight

  return { gesture: winner[0], confidence: Math.min(confidence, 0.99) }
}

export function useGestureClassifier() {
  const [trainingData, setTrainingData] = useState(() => {
    try {
      const saved = localStorage.getItem('elysia-training-data')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const smoothingBuffer = useRef([])
  const SMOOTHING_FRAMES = 10

  useEffect(() => {
    localStorage.setItem('elysia-training-data', JSON.stringify(trainingData))
  }, [trainingData])

  const classify = useCallback((landmarks, confidenceThreshold = 0.75) => {
    if (!landmarks || landmarks.length === 0) return null

    const normalized = normalizeLandmarks(landmarks)
    
    // Try custom KNN first if we have training data
    let result = knnClassify(normalized, trainingData)
    
    // Fall back to rule-based ASL
    if (!result || result.confidence < confidenceThreshold) {
      const aslResult = classifyASL(landmarks)
      if (aslResult && aslResult.confidence >= confidenceThreshold) {
        result = aslResult
      } else {
        result = null
      }
    }

    if (!result) {
      smoothingBuffer.current = []
      return null
    }

    // Add to smoothing buffer
    smoothingBuffer.current.push(result.gesture)
    if (smoothingBuffer.current.length > SMOOTHING_FRAMES) {
      smoothingBuffer.current.shift()
    }

    // Majority vote
    const votes = {}
    smoothingBuffer.current.forEach(g => { votes[g] = (votes[g] || 0) + 1 })
    const topGesture = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]
    
    if (topGesture[1] >= Math.ceil(SMOOTHING_FRAMES * 0.5)) {
      return { gesture: topGesture[0], confidence: result.confidence, normalized }
    }

    return null
  }, [trainingData])

  const addTrainingSample = useCallback((label, landmarks) => {
    const normalized = normalizeLandmarks(landmarks)
    if (!normalized) return

    setTrainingData(prev => [...prev, { label, landmarks: normalized, timestamp: Date.now() }])
  }, [])

  const deleteGesture = useCallback((label) => {
    setTrainingData(prev => prev.filter(s => s.label !== label))
  }, [])

  const getGestureStats = useCallback(() => {
    const stats = {}
    trainingData.forEach(({ label }) => {
      stats[label] = (stats[label] || 0) + 1
    })
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

  const importModel = useCallback((jsonData) => {
    try {
      const parsed = JSON.parse(jsonData)
      if (parsed.trainingData) {
        setTrainingData(parsed.trainingData)
        return true
      }
    } catch { return false }
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
