'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState } from 'react'

interface Props {
  userId: string
  userName: string
}

export default function CoachChat({ userId, userName }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/coach',
      body: { userId, type: 'chat' },
    }),
  })

  const welcomeMessage = `嗨 ${userName}！我是你的 AI 教練「小聯」🤖\n\n你可以問我任何關於飲食、體重管理的問題，像是：\n- 「我今天可以吃火鍋嗎？」\n- 「為什麼我體重突然上升？」\n- 「幫我分析最近的飲食狀況」\n\n也可以拍食物照片上傳到飲食紀錄頁，我會幫你分析營養搭配 📸`

  const allMessages = [
    { id: 'welcome', role: 'assistant' as const, content: welcomeMessage, parts: [{ type: 'text' as const, text: welcomeMessage }] },
    ...messages,
  ]

  const isStreaming = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [allMessages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">AI 教練 小聯</h1>
          <p className="text-xs text-gray-400">你的專屬減脂顧問</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {allMessages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-sm">🤖</span>
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-emerald-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-bl-md'
              }`}
            >
              {(message.parts ?? []).map((part, i) => {
                if (part.type === 'text') return <span key={i}>{part.text}</span>
                return null
              })}
            </div>
          </div>
        ))}

        {isStreaming && allMessages[allMessages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="問教練任何減肥問題..."
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow hover:shadow-md transition active:scale-[0.98] disabled:opacity-50"
          >
            送出
          </button>
        </div>
      </form>
    </div>
  )
}
