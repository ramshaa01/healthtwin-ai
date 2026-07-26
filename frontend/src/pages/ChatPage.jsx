import { useState, useRef, useEffect } from "react"
import Navbar from "../components/Navbar"
import client from "../api/client"

const QUICK_QUESTIONS = [
  "What causes diabetes?",
  "How to lower blood pressure?",
  "Why is my risk high?",
  "Best diet for heart health?",
  "How to reduce stress?",
  "How much exercise do I need?",
]

function Bubble({ msg }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 animate-fade-in`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm mr-2 shrink-0 mt-1">
          🏥
        </div>
      )}
      <div className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
        ${isUser
          ? "bg-primary-700 text-white rounded-br-sm"
          : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
        }`}>
        {msg.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm ml-2 shrink-0 mt-1">
          👤
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! I am your HealthTwin AI health assistant.\n\nI can answer questions about diabetes, heart disease, hypertension, obesity, and stress.\n\nTry one of the quick questions below or type your own!"
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: msg }])
    setLoading(true)
    try {
      const res = await client.post("/api/chat", {
        message: msg,
        include_predictions: true
      })
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.response
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I could not connect. Please check your connection and try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <Navbar />
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 flex flex-col"
           style={{ height: "calc(100vh - 64px)" }}>

        {/* Header */}
        <div className="card mb-4 flex items-center gap-3 py-4">
          <div className="w-12 h-12 bg-primary-700 rounded-2xl flex items-center justify-center text-2xl shadow-md">
            🏥
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Health Assistant</h2>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"/>
              Online — instant health guidance
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-3 px-1">
          {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm mr-2">
                🏥
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0,1,2].map(i => (
                    <div key={i}
                      className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => send(q)} disabled={loading}
              className="text-xs bg-primary-50 text-primary-700 border border-primary-200
                         rounded-full px-3 py-1.5 hover:bg-primary-100 transition-all
                         disabled:opacity-50">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Ask about your health..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            disabled={loading}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="btn-primary px-5 disabled:opacity-50">
            ➤
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          General health information only. Consult a doctor for medical advice.
        </p>
      </div>
    </div>
  )
}
