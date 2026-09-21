'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Paperclip } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string
  sender: { name: string; avatarUrl?: string | null }
}

interface ChatWindowProps {
  receiverId: string
  receiverName: string
  receiverAvatar?: string | null
  contractId?: string
}

export default function ChatWindow({ receiverId, receiverName, receiverAvatar, contractId }: ChatWindowProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/messages?with=${receiverId}`)
      .then(r => r.json())
      .then(setMessages)
  }, [receiverId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const optimistic: Message = {
      id: Date.now().toString(),
      senderId: session!.user.id,
      content: input,
      createdAt: new Date().toISOString(),
      sender: { name: session!.user.name || '', avatarUrl: session!.user.image },
    }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content: input, contractId }),
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <Avatar src={receiverAvatar} name={receiverName} size="sm" />
        <p className="font-semibold text-gray-900 text-sm">{receiverName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map(msg => {
          const isMe = msg.senderId === session?.user?.id
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar src={msg.sender.avatarUrl} name={msg.sender.name} size="xs" />
              <div className={`max-w-xs md:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-primary-900 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
                <p className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-3 px-5 py-4 border-t border-gray-100">
        <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
          <Paperclip size={18} />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center text-white hover:bg-primary-800 transition-colors disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}