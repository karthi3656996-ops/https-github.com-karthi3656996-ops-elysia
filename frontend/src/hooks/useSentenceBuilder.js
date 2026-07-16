import { useRef, useCallback, useState } from 'react'

export function useSentenceBuilder() {
  const wordBuffer = useRef([])
  const lastGestureRef = useRef(null)
  const gestureStartRef = useRef(null)
  const HOLD_DURATION_MS = 1500 // hold 1.5s to confirm word
  const PAUSE_DURATION_MS = 3000 // 3s silence = end sentence

  const [sentence, setSentence] = useState('')
  const [currentWord, setCurrentWord] = useState('')
  const lastActivityRef = useRef(Date.now())

  const processGesture = useCallback((gesture) => {
    const now = Date.now()
    lastActivityRef.current = now

    if (gesture !== lastGestureRef.current) {
      lastGestureRef.current = gesture
      gestureStartRef.current = now
      setCurrentWord(gesture || '')
      return
    }

    // Gesture held long enough → commit as word
    if (gestureStartRef.current && now - gestureStartRef.current >= HOLD_DURATION_MS) {
      if (gesture && !wordBuffer.current.includes(gesture)) {
        wordBuffer.current.push(gesture)
        setSentence(wordBuffer.current.join(' '))
      }
      gestureStartRef.current = now // reset hold timer
    }
  }, [])

  const clearSentence = useCallback(() => {
    wordBuffer.current = []
    lastGestureRef.current = null
    gestureStartRef.current = null
    setSentence('')
    setCurrentWord('')
  }, [])

  const getHoldProgress = useCallback(() => {
    if (!gestureStartRef.current || !lastGestureRef.current) return 0
    const elapsed = Date.now() - gestureStartRef.current
    return Math.min(elapsed / HOLD_DURATION_MS, 1)
  }, [])

  return { sentence, currentWord, processGesture, clearSentence, getHoldProgress }
}
