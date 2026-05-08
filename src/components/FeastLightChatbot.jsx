// src/components/FeastLightChatbot.jsx
// Floating chatbot powered by Claude API via local proxy.
// Add this to your .env file:
//   ANTHROPIC_API_KEY=your-key-here
//   VITE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=csv

import { useState, useRef, useEffect } from 'react'
import { X, MessageCircle, Send, Loader2, ChevronDown } from 'lucide-react'

// ── CSV parser ─────────────────────────────────────────────────────────────
function parseCsv(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.replace(/"/g, '').trim())
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
}

// ── Fetch & cache Google Sheet data ───────────────────────────────────────
let _cachedContext = null

async function buildContext() {
  if (_cachedContext) return _cachedContext

  const csvUrl = import.meta.env.VITE_SHEET_CSV_URL
  if (!csvUrl) {
    _cachedContext = '(No sheet data configured — answer from general Feast Light knowledge.)'
    return _cachedContext
  }

  try {
    const res = await fetch(csvUrl)
    const text = await res.text()
    const rows = parseCsv(text)
    _cachedContext = '=== FEAST LIGHT DATA ===\n' + JSON.stringify(rows, null, 2)
  } catch {
    _cachedContext = '(Sheet data could not be loaded — answer from general Feast Light knowledge.)'
  }

  return _cachedContext
}

// ── System prompt ──────────────────────────────────────────────────────────
function buildSystemPrompt(context) {
  return `You are a friendly, knowledgeable assistant for The Feast Light — a Catholic community gathering movement founded by Bo Sanchez that nourishes homes, villages, and hearts with God's word.

Your role:
- Answer questions about The Feast Light: its mission, schedule, locations, events, and community.
- Help people find their nearest Feast Light gathering.
- Share information about leaders, upcoming talks, and how to join.
- Keep answers warm, faith-filled, and concise (2–4 sentences unless more detail is needed).
- If you don't know something, say so kindly and suggest visiting feastlight.com.

Here is the latest data from the community records:

${context || '(No external data loaded yet — answer from general Feast Light knowledge.)'}

Always respond in a warm, welcoming, community-oriented tone.`
}

// ── Message bubble ─────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-feast-red flex items-center justify-center flex-shrink-0 mb-0.5">
          <img src="/Feast-Light-Logo-x180.png" alt="Feast Light" className="w-5 h-5 object-contain" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-feast-red text-white rounded-br-sm'
            : 'bg-white/10 text-white/90 rounded-bl-sm border border-white/10'
          }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

// ── Suggested questions ────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Where is the nearest Feast Light?',
  'What time does Feast Light start?',
  'How do I join the community?',
  'Who is Bo Sanchez?',
]

// ── Main component ─────────────────────────────────────────────────────────
export default function FeastLightChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Feast Light guide 🙏 Ask me anything about our community, schedules, or how to join!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [contextReady, setContextReady] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(buildSystemPrompt(''))
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    buildContext().then(ctx => {
      setSystemPrompt(buildSystemPrompt(ctx))
      setContextReady(true)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setUnread(0)
    }
  }, [open])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      // ✅ Calls your local proxy at localhost:3001, not Anthropic directly
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data?.content?.[0]?.text || "I'm sorry, I couldn't get a response. Please try again!"

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Is the proxy server running? (node server.js) 🙏' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(o => !o)}
          className="relative w-14 h-14 rounded-full bg-feast-red shadow-[0_4px_24px_rgba(255,75,75,0.5)] 
                     flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Open chatbot"
        >
          <div className={`absolute transition-all duration-300 ${open ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
            <X size={22} className="text-white" />
          </div>
          <div className={`absolute transition-all duration-300 ${open ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
            <MessageCircle size={22} className="text-white" fill="white" />
          </div>
          {unread > 0 && !open && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 text-feast-dark text-[10px] font-black flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-2rem)]
                    bg-[#0f0c1e] border border-white/10 rounded-2xl shadow-2xl
                    flex flex-col overflow-hidden
                    transition-all duration-300 origin-bottom-right
                    ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
        style={{ height: '480px' }}
      >
        {/* Header */}
        <div className="bg-feast-red px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <img src="/Feast-Light-Logo-x180.png" alt="Feast Light" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Feast Light Assistant</div>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${contextReady ? 'bg-green-300' : 'bg-yellow-300'}`} />
                <span className="text-white/70 text-[10px]">{contextReady ? 'Online' : 'Loading data…'}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-feast-red/40 text-feast-red/90
                             hover:bg-feast-red/10 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex gap-2 items-end mb-3">
              <div className="w-7 h-7 rounded-full bg-feast-red flex items-center justify-center flex-shrink-0">
                <img src="/Feast-Light-Logo-x180.png" alt="Feast Light" className="w-5 h-5 object-contain" />
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-white/10">
          <div className="flex gap-2 items-end bg-white/5 rounded-xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about Feast Light…"
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 resize-none outline-none 
                         leading-relaxed max-h-24 overflow-y-auto"
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-feast-red flex items-center justify-center flex-shrink-0
                         disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500 transition-colors"
            >
              {loading
                ? <Loader2 size={14} className="text-white animate-spin" />
                : <Send size={14} className="text-white" />
              }
            </button>
          </div>
          <p className="text-white/20 text-[10px] text-center mt-1.5">Powered by Feast · Feast Light data</p>
        </div>
      </div>
    </>
  )
}