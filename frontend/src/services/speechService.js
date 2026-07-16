// Speech synthesis service using Web Speech API
class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis
    this.voices = []
    this.settings = {
      rate: 1,
      pitch: 1,
      volume: 1,
      voiceName: '',
      lang: 'en-US',
    }
    this.speaking = false
    this.loadVoices()
  }

  loadVoices() {
    const load = () => {
      this.voices = this.synth.getVoices()
    }
    load()
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load
    }
  }

  getVoices() {
    return this.voices.filter(v => v.lang.startsWith('en'))
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
  }

  speak(text, onEnd) {
    if (!text || !this.synth) return
    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this.settings.rate
    utterance.pitch = this.settings.pitch
    utterance.volume = this.settings.volume
    utterance.lang = this.settings.lang

    if (this.settings.voiceName) {
      const voice = this.voices.find(v => v.name === this.settings.voiceName)
      if (voice) utterance.voice = voice
    }

    utterance.onstart = () => { this.speaking = true }
    utterance.onend = () => {
      this.speaking = false
      onEnd?.()
    }
    utterance.onerror = () => { this.speaking = false }

    this.synth.speak(utterance)
  }

  stop() {
    this.synth?.cancel()
    this.speaking = false
  }

  isSpeaking() {
    return this.synth?.speaking || false
  }
}

export const speechService = typeof window !== 'undefined' ? new SpeechService() : null
