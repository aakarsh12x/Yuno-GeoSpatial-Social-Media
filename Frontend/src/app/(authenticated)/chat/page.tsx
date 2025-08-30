'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  User, 
  MoreVertical, 
  Search, 
  Phone, 
  Video,
  ArrowLeft,
  Plus,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import { useSidebar } from '@/context/SidebarContext'

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
  email: string
  city: string
  school: string
  college: string
  workplace: string
  interests: string[]
  status: 'online' | 'offline' | 'away'
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  chatId: string
}

export default function ChatPage() {
  const { isCollapsed } = useSidebar()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [inputMessage, setInputMessage] = useState('')
  const [selectedChat, setSelectedChat] = useState<string | null>(null) // Don't auto-select any chat
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat users from backend
  useEffect(() => {
    const loadChatUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/discover?radius=20', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const users = data.data.users.map((user: any, index: number) => ({
            id: user.id.toString(),
            name: user.name,
            email: user.email || `${user.name.toLowerCase().replace(' ', '.')}@example.com`,
            city: user.city || 'Mumbai',
            school: user.school || 'University',
            college: user.college || 'University',
            workplace: user.workplace || 'Company',
            interests: user.interests || ['tech', 'music', 'travel'],
            status: ['online', 'away', 'offline'][index % 3] as 'online' | 'away' | 'offline',
            lastMessage: 'Start a conversation!',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            chatId: user.id.toString()
          }));
          setChatUsers(users);
        }
      } catch (error) {
        console.error('Error loading chat users:', error);
        // Fallback to mock data if backend fails
        setChatUsers([
          {
            id: '1',
            name: 'Priya Sharma',
            email: 'priya@example.com',
            city: 'Mumbai',
            school: 'St. Xavier\'s College',
            college: 'Mumbai University',
            workplace: 'Tech Solutions',
            interests: ['music', 'travel', 'tech', 'reading'],
            status: 'online',
            lastMessage: 'Start a conversation!',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            chatId: '1'
          },
          {
            id: '2',
            name: 'Ananya Patel',
            email: 'ananya@example.com',
            city: 'Bangalore',
            school: 'Christ University',
            college: 'Christ University',
            workplace: 'Innovation Labs',
            interests: ['gaming', 'tech', 'travel', 'movies'],
            status: 'online',
            lastMessage: 'Start a conversation!',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            chatId: '2'
          },
          {
            id: '3',
            name: 'Arjun Singh',
            email: 'arjun@example.com',
            city: 'Delhi',
            school: 'Delhi Public School',
            college: 'Delhi University',
            workplace: 'StartupXYZ',
            interests: ['sports', 'tech', 'cooking', 'gaming'],
            status: 'away',
            lastMessage: 'Start a conversation!',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            chatId: '3'
          },
          {
            id: '4',
            name: 'Zara Khan',
            email: 'zara@example.com',
            city: 'Hyderabad',
            school: 'Osmania University',
            college: 'Osmania University',
            workplace: 'Creative Studio',
            interests: ['art', 'photography', 'travel', 'music'],
            status: 'offline',
            lastMessage: 'Start a conversation!',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            chatId: '4'
          },
          {
            id: '5',
            name: 'Kavya Reddy',
            email: 'kavya@example.com',
            city: 'Chennai',
            school: 'Chennai University',
            college: 'Chennai University',
            workplace: 'Digital Solutions',
            interests: ['dance', 'music', 'tech', 'fashion'],
            status: 'online',
            lastMessage: 'Start a conversation!',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            chatId: '5'
          },
          {
            id: '6',
            name: 'Rahul Verma',
            email: 'rahul@example.com',
            city: 'Pune',
            school: 'Pune University',
            college: 'Pune University',
            workplace: 'Tech Innovations',
            interests: ['cricket', 'tech', 'music', 'travel'],
            status: 'away',
            lastMessage: 'Start a conversation!',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            chatId: '6'
          }
        ]);
      }
    };
    
    loadChatUsers();
  }, [])

  // Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No access token found, skipping socket connection');
      return;
    }

    const newSocket = io('http://localhost:5000', {
      transports: ['polling', 'websocket'],
      autoConnect: false,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: token
      }
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to chat server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from chat server')
    })

    newSocket.on('connect_error', (error) => {
      setIsConnected(false)
      console.log('Connection error:', error.message)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      setIsConnected(true)
      console.log('Reconnected to chat server after', attemptNumber, 'attempts')
    })

    newSocket.on('reconnect_error', (error) => {
      console.log('Reconnection error:', error.message)
    })

    // Handle incoming messages
    newSocket.on('message', (message: Message) => {
      console.log('Received message:', message);
      setMessages(prev => ({
        ...prev,
        [message.chatId]: [...(prev[message.chatId] || []), message]
      }))
    })

    // Handle chat history
    newSocket.on('chat_history', (history: Message[]) => {
      console.log('Received chat history:', history);
      const groupedMessages: Record<string, Message[]> = {}
      history.forEach(message => {
        if (!groupedMessages[message.chatId]) {
          groupedMessages[message.chatId] = []
        }
        groupedMessages[message.chatId].push(message)
      })
      setMessages(groupedMessages)
    })

    // Handle typing indicators
    newSocket.on('user_typing', (data: { chatId: string, userId: string, userName: string }) => {
      console.log('User typing:', data);
    })

    newSocket.on('user_stop_typing', (data: { chatId: string, userId: string }) => {
      console.log('User stopped typing:', data);
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])


  // Auto-scroll to bottom only when new messages are added (not when selecting a chat)
  useEffect(() => {
    if (selectedChat && messages[selectedChat] && messages[selectedChat].length > 0) {
      // Only auto-scroll if the last message was just added (not when loading chat history)
      const lastMessage = messages[selectedChat][messages[selectedChat].length - 1];
      if (lastMessage && !lastMessage.id.startsWith('welcome_') && lastMessage.timestamp) {
        // Check if this is a recent message (within last 5 seconds)
        const messageTime = new Date(lastMessage.timestamp).getTime();
        const currentTime = Date.now();
        if (currentTime - messageTime < 5000) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }, [messages])

  // Connect to socket when component mounts
  useEffect(() => {
    if (socket && !socket.connected) {
      // Try to connect with a delay to allow backend to start
      const connectTimeout = setTimeout(() => {
        socket.connect()
      }, 1000)
      
      return () => clearTimeout(connectTimeout)
    }
  }, [socket])

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: Date | string) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid time';
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !socket || !selectedChat) return

    const messageText = inputMessage.trim();
    const message: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'You',
      timestamp: new Date(),
      isOwn: true,
      chatId: selectedChat
    }

    // Add message to local state immediately for instant feedback
    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), message]
    }))
    setInputMessage('')
    
    // Focus input for next message
    inputRef.current?.focus()

    // Send message to server
    try {
      socket.emit('send_message', {
        chatId: selectedChat,
        message: {
          text: messageText,
          chatId: selectedChat,
          timestamp: new Date().toISOString()
        }
      })

      // Update the last message in chat users
      setChatUsers(prev => prev.map(user => 
        user.id === selectedChat 
          ? { ...user, lastMessage: messageText, lastMessageTime: 'Just now' }
          : user
      ))

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the message from local state if sending failed
      setMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat]?.filter(m => m.id !== message.id) || []
      }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectChat = async (chatId: string) => {
    setSelectedChat(chatId)
    
    // Join chat room
    if (socket) {
      socket.emit('join_chat', chatId)
    }

    // Load chat history from backend
    try {
      const response = await fetch(`http://localhost:5000/api/chat/chats/${chatId}?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.messages && data.data.messages.length > 0) {
          const formattedMessages: Message[] = data.data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.content,
            sender: msg.sender_name || 'Unknown',
            timestamp: new Date(msg.created_at),
            isOwn: msg.sender_id === parseInt(localStorage.getItem('userId') || '0'),
            chatId: chatId
          }));
          
          setMessages(prev => ({
            ...prev,
            [chatId]: formattedMessages
          }));
        } else {
          // If no messages exist, add a welcome message
          const selectedUser = chatUsers.find(user => user.id === chatId);
          const welcomeMessage: Message = {
            id: `welcome_${chatId}`,
            text: `Hi! I'm ${selectedUser?.name || 'a user'}. Start a conversation with me!`,
            sender: selectedUser?.name || 'User',
            timestamp: new Date(),
            isOwn: false,
            chatId: chatId
          };
          
          setMessages(prev => ({
            ...prev,
            [chatId]: [welcomeMessage]
          }));
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // If backend fails, start with a welcome message
      const selectedUser = chatUsers.find(user => user.id === chatId);
      const welcomeMessage: Message = {
        id: `welcome_${chatId}`,
        text: `Hi! I'm ${selectedUser?.name || 'a user'}. Start a conversation with me!`,
        sender: selectedUser?.name || 'User',
        timestamp: new Date(),
        isOwn: false,
        chatId: chatId
      };
      
      setMessages(prev => ({
        ...prev,
        [chatId]: [welcomeMessage]
      }));
    }
  }

  const filteredUsers = chatUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedUser = chatUsers.find(user => user.id === selectedChat)
  const currentChatMessages = selectedChat ? (messages[selectedChat] || []) : []
  


  return (
    <div className="min-h-screen bg-background">
      <div className="flex absolute inset-0 top-16">
                 {/* Chat Sidebar */}
         <div className={`w-full md:w-80 bg-surface/90 backdrop-blur-md border-r-2 border-border-medium flex flex-col transition-all duration-300 ${
           isCollapsed ? 'left-16' : 'left-64'
         } absolute top-0 h-full`}>
          {/* Header */}
          <div className="p-3 border-b border-border-medium">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-text-primary">Messages</h1>
              <button className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border-medium rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ backgroundColor: 'rgba(139, 69, 19, 0.05)' }}
                className={`p-3 border-b border-border-light/50 cursor-pointer transition-all ${
                  selectedChat === user.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                }`}
                onClick={() => selectChat(user.id)}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                      user.status === 'online' ? 'bg-green-500' : 
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {user.name}
                      </h3>
                      <span className="text-xs text-text-muted ml-2">
                        {user.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {user.lastMessage}
                    </p>
                  </div>
                  
                  {user.unreadCount > 0 && (
                    <div className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-2">
                      {user.unreadCount}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Main Area */}
        <div className={`hidden md:flex flex-col absolute top-0 bottom-0 ${
          isCollapsed ? 'left-[calc(4rem+20rem)]' : 'left-[calc(16rem+20rem)]'
        } right-0`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-surface/90 backdrop-blur-md border-b border-border-medium p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                        selectedUser?.status === 'online' ? 'bg-green-500' : 
                        selectedUser?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">
                        {selectedUser?.name}
                      </h2>
                      <p className="text-xs text-text-secondary">
                        {selectedUser?.status === 'online' ? 'Online' : 
                         selectedUser?.status === 'away' ? 'Away' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 bg-background min-h-0 h-[calc(100vh-16rem-8rem)]">
                <AnimatePresence>
                  {currentChatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${
                        message.isOwn
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-surface border border-border-medium text-text-primary rounded-bl-md'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-0.5 ${
                          message.isOwn ? 'text-white/70' : 'text-text-muted'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-surface/90 backdrop-blur-md border-t border-border-medium p-3">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-surface border border-border-medium rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
                                           ) : (
                           /* Welcome State */
               <div className="flex-1 flex items-center justify-center min-h-0 h-[calc(100vh-16rem-8rem)]">
               <div className="text-center">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                   <MessageCircle className="w-8 h-8 text-primary" />
                 </div>
                 <h2 className="text-xl font-bold text-text-primary mb-1 italic font-light">
                   Welcome to Yuno Chat
                 </h2>
                 <p className="text-sm text-text-secondary">
                   Choose a person from the list to start a conversation
                 </p>
               </div>
             </div>
          )}
        </div>

                 {/* Mobile Chat View */}
         {selectedChat && (
           <div className="md:hidden fixed inset-0 bg-background z-50 top-16">
             <div className="flex flex-col h-[calc(100vh-4rem)]">
              {/* Mobile Chat Header */}
              <div className="bg-surface/90 backdrop-blur-md border-b border-border-medium p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                        selectedUser?.status === 'online' ? 'bg-green-500' : 
                        selectedUser?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">
                        {selectedUser?.name}
                      </h2>
                      <p className="text-xs text-text-secondary">
                        {selectedUser?.status === 'online' ? 'Online' : 
                         selectedUser?.status === 'away' ? 'Away' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Message Input */}
              <div className="bg-surface/90 backdrop-blur-md border-t border-border-medium p-3">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-surface border border-border-medium rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed bottom-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs">Connecting to chat server...</span>
          </div>
        </div>
      )}
      
      {/* Connected Status Indicator */}
      {isConnected && (
        <div className="fixed bottom-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span className="text-xs">Connected to chat</span>
          </div>
        </div>
      )}
    </div>
  )
}
