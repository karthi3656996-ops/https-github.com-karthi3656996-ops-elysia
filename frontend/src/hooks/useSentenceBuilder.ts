import { useRef, useCallback, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────

const HOLD_DURATION_MS = 1500  // hold 1.5s to confirm word
const PAUSE_DURATION_MS = 3000 // unused currently — reserved for auto-end

interface SentenceBuilderReturn {
  sentence: string
  currentWord: string
  processGesture: (gesture: string | null) => void
  clearSentence: () => void
  getHoldProgress: () => number
}

export function useSentenceBuilder(): SentenceBuilderReturn {
  const wordBuffer = useRef<string[]>([])
  const lastGestureRef = useRef<string | null>(null)
  const gestureStartRef = useRef<number | null>(null)

  const [sentence, setSentence] = useState('')
  const [currentWord, setCurrentWord] = useState('')

  const processGesture = useCallback((gesture: string | null) => {
    const now = Date.now()

    if (gesture !== lastGestureRef.current) {
      lastGestureRef.current = gesture
      gestureStartRef.current = now
      setCurrentWord(gesture ?? '')
      return
    }

    // Gesture held long enough → commit as word
    if (gestureStartRef.current && now - gestureStartRef.current >= HOLD_DURATION_MS) {
      if (gesture && !wordBuffer.current.includes(gesture)) {
        wordBuffer.current.push(gesture)
        setSentence(wordBuffer.current.join(' '))
      }
      gestureStartRef.current = now // reset hold timer to prevent repeat
    }
  }, [])

  const clearSentence = useCallback(() => {
    wordBuffer.current = []
    lastGestureRef.current = null
    gestureStartRef.current = null
    setSentence('')
    setCurrentWord('')
  }, [])

  const getHoldProgress = useCallback((): number => {
    if (!gestureStartRef.current || !lastGestureRef.current) return 0
    const elapsed = Date.now() - gestureStartRef.current
    return Math.min(elapsed / HOLD_DURATION_MS, 1)
  }, [])

  void PAUSE_DURATION_MS // suppress unused warning — reserved

  return { sentence, currentWord, processGesture, clearSentence, getHoldProgress }
}
