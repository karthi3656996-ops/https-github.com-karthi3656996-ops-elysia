import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiRobotLine, RiSendPlaneLine, RiDeleteBinLine, RiUserLine } from 'react-icons/ri'
import type { ChatMessage } from '@/types'

const SUGGESTIONS = ['How do I sign "Hello"?', 'What is ASL?', 'Show me emergency signs', 'How to train custom gestures?']

const FAQ: Record<string, string> = {
  hello: 'To sign "Hello" in ASL: Open your hand with fingers together, place it near your forehead, then move it outward like a salute. 👋',
  asl: 'ASL (American Sign Language) is a complete, natural language with its own grammar and syntax, used by the Deaf community in the US and Canada. It uses hand shapes, movement, and facial expressions.',
  emergency: 'Key emergency signs: HELP (fist on open palm, both rise up), CALL 911 (mimick phone then sign numbers), DANGER (cross fists, pull apart). 🆘',
  train: 'To train a custom gesture: Go to the Train AI page → Enter a gesture name → Record 20 samples → Click Train Model. Your gesture is then recognized instantly!',
  default: "I'm Elysia's AI assistant specializing in sign language! Ask me about specific gestures, ASL tips, how to use the translator, or anything about the Deaf community. 🤝",
}

function getResponse(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi')) return FAQ.hello
  if (lower.includes('asl') || lower.includes('american sign')) return FAQ.asl
  if (lower.includes('emergency') || lower.includes('danger') || lower.includes('help')) return FAQ.emergency
  if (lower.includes('train') || lower.includes('custom') || lower.includes('gesture')) return FAQ.train
  return FAQ.default
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: "Hi! I'm Elysia's AI Sign Language Assistant. I can help you learn signs, understand ASL, and guide you through the platform. What would you like to know? 🤟", timestamp: Date.now() }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500))
    const response = getResponse(text)
    setTyping(false)
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() }])
  }

  return (
    <div className="min-h-screen pt-20 pb-4 px-4 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <RiRobotLine size={18} className="text-purple-400" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white">AI <span className="text-gradient">Sign Assistant</span></h1>
          </div>
          <p className="text-gray-500 ml-12">Ask anything about sign language, gestures, or how to use Elysia</p>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 glass-card p-4 overflow-y-auto gesture-scroll space-y-4 mb-4 min-h-[400px] max-h-[500px]">
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-purple-600/30 border border-purple-500/30' : 'bg-white/10 border border-white/10'}`}>
                {msg.role === 'assistant' ? <RiRobotLine size={14} className="text-purple-400" /> : <RiUserLine size={14} className="text-gray-300" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-white/5 text-gray-200' : 'bg-purple-600/20 border border-purple-500/20 text-purple-100'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <RiRobotLine size={14} className="text-purple-400" />
                </div>
                <div className="bg-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => <motion.div key={i} className="w-2 h-2 bg-purple-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="flex gap-2 flex-wrap mb-3">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all">
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about sign language…"
            className="input-neon flex-1" />
          <button type="button" onClick={() => { setMessages([{ id: '0', role: 'assistant', content: "Hi! I'm Elysia's AI assistant. How can I help? 🤟", timestamp: Date.now() }]); setInput('') }}
            className="p-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 transition-all">
            <RiDeleteBinLine size={18} />
          </button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={!input.trim() || typing}
            className="btn-neon px-4 py-3 disabled:opacity-50">
            <RiSendPlaneLine size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  )
}
