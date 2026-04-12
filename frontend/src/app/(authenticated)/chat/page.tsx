'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  User, 
  Search, 
  ArrowLeft,
  MessageCircle
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date | string
  isOwn: boolean
  chatId: string
}

interface ChatUser {
  id: string
  name: string
  status: 'online' | 'offline' | 'away'
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  chatId: string
}

export default function ChatPage() {
  const { user: authUser } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [inputMessage, setInputMessage] = useState('')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat users from backend (only real users)
  useEffect(() => {
    const loadChatUsers = async () => {
      setLoadingUsers(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discover?radius=50`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const users = (data.data?.users || []).map((u: any) => ({
            id: u.id.toString(),
            name: u.name,
            status: 'offline' as const,
            lastMessage: '',
            lastMessageTime: '',
            unreadCount: 0,
            chatId: u.id.toString()
          }))
          setChatUsers(users)
        }
      } catch (error) {
        console.error('Error loading chat users:', error)
      } finally {
        setLoadingUsers(false)
      }
    }
    
    loadChatUsers()
  }, [])

  // Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['polling', 'websocket'],
      autoConnect: false,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token }
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('connect_error', () => {
      setIsConnected(false)
    })

    newSocket.on('message', (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.chatId]: [...(prev[message.chatId] || []), message]
      }))
    })

    newSocket.on('chat_history', (history: Message[]) => {
      const grouped: Record<string, Message[]> = {}
      history.forEach(m => {
        if (!grouped[m.chatId]) grouped[m.chatId] = []
        grouped[m.chatId].push(m)
      })
      setMessages(grouped)
    })

    setSocket(newSocket)
    return () => { newSocket.close() }
  }, [])

  // Connect socket
  useEffect(() => {
    if (socket && !socket.connected) {
      const t = setTimeout(() => socket.connect(), 500)
      return () => clearTimeout(t)
    }
  }, [socket])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedChat])

  const formatTimestamp = (timestamp: Date | string) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || !selectedChat) return

    const text = inputMessage.trim()
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: authUser?.name || 'You',
      timestamp: new Date(),
      isOwn: true,
      chatId: selectedChat
    }

    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), message]
    }))
    setInputMessage('')
    inputRef.current?.focus()

    socket.emit('send_message', {
      chatId: selectedChat,
      message: { text, chatId: selectedChat, timestamp: new Date().toISOString() }
    })

    setChatUsers(prev => prev.map(u => 
      u.id === selectedChat 
        ? { ...u, lastMessage: text, lastMessageTime: 'Now' }
        : u
    ))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectChat = (chatId: string) => {
    setSelectedChat(chatId)
    if (socket) socket.emit('join_chat', chatId)

    // Load history from backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/chats/${chatId}?limit=50`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.messages?.length > 0) {
          const formatted = data.data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.content,
            sender: msg.sender_name || 'Unknown',
            timestamp: new Date(msg.created_at),
            isOwn: msg.sender_id === parseInt(localStorage.getItem('userId') || '0'),
            chatId
          }))
          setMessages(prev => ({ ...prev, [chatId]: formatted }))
        }
      })
      .catch(() => {})
  }

  const filteredUsers = chatUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedUser = chatUsers.find(u => u.id === selectedChat)
  const currentMessages = selectedChat ? (messages[selectedChat] || []) : []

  return (
    <div className="h-[calc(100vh-7rem)] flex border border-border-light rounded-xl overflow-hidden bg-white">
      
      {/* Conversation List */}
      <div className={`w-80 flex-shrink-0 border-r border-border-light flex flex-col bg-white ${
        selectedChat ? 'hidden md:flex' : 'flex'
      }`}>
        {/* List Header */}
        <div className="p-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-hover-light border-none rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No conversations yet</p>
              <p className="text-xs text-text-muted mt-1">Discover people nearby to start chatting</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-border-light/50 ${
                  selectedChat === user.id 
                    ? 'bg-hover-light' 
                    : 'hover:bg-hover-light/50'
                }`}
                onClick={() => selectChat(user.id)}
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary truncate">{user.name}</span>
                    {user.lastMessageTime && (
                      <span className="text-[11px] text-text-muted ml-2 flex-shrink-0">{user.lastMessageTime}</span>
                    )}
                  </div>
                  {user.lastMessage && (
                    <p className="text-xs text-text-muted truncate mt-0.5">{user.lastMessage}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        !selectedChat ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedChat && selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border-light flex items-center gap-3 bg-white flex-shrink-0">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {selectedUser.name[0]}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary truncate">{selectedUser.name}</h3>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-background">
              {currentMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-sm text-text-muted">No messages yet</p>
                    <p className="text-xs text-text-muted mt-1">Say hello to start a conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl ${
                        msg.isOwn
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white border border-border-light text-text-primary rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${
                          msg.isOwn ? 'text-white/60' : 'text-text-muted'
                        }`}>
                          {formatTimestamp(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border-light bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Write a message..."
                  className="flex-1 px-4 py-2.5 bg-hover-light border-none rounded-full text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-full hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-border-medium mx-auto mb-3" />
              <h2 className="text-lg font-bold text-text-primary mb-1">Your Messages</h2>
              <p className="text-sm text-text-muted max-w-xs">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Connection indicator */}
      <div className={`fixed bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium z-50 flex items-center gap-1.5 ${
        isConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        {isConnected ? 'Connected' : 'Connecting...'}
      </div>
    </div>
  )
}
