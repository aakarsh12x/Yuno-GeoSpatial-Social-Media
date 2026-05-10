'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  User, 
  MapPin, 
  School, 
  Building, 
  Heart, 
  Send, 
  Check, 
  X,
  Search,
  Users,
  Clock,
  MessageCircle
} from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import { DiscoverAPI, SparksAPI } from '@/lib/api'
import { geospatialService } from '@/lib/geospatialService'

interface NearbyUser {
  id: number
  name: string
  email: string
  age: number
  city: string
  school: string
  college: string
  workplace: string
  interests: string[]
  distance_km: number
  commonality_score: number
  common_attributes: string[]
  common_interests: string[]
  hasSpark: boolean
  sparkStatus: string | null
}

interface PendingSpark {
  id: number
  sender_id: number
  sender_name: string
  sender_email: string
  sender_city: string
  sender_school: string
  sender_college: string
  sender_workplace: string
  sender_interests: string[]
  sender_age: number
  message: string
  created_at: string
  status: string
}
interface AcceptedSpark {
  id: number
  other_user_id: number
  other_name: string
  other_email: string
  other_city: string
  other_age: number
  created_at: string
  chatId?: number | null
}

export default function SparksPage() {
  const router = useRouter()
  const { isCollapsed } = useSidebar()
  const { token, isAuthenticated, user } = useAuth()
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [pendingSparks, setPendingSparks] = useState<PendingSpark[]>([])
  const [acceptedSparks, setAcceptedSparks] = useState<AcceptedSpark[]>([])
  const [activeTab, setActiveTab] = useState<'nearby' | 'pending' | 'accepted'>('nearby')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null)
  const [sparkMessage, setSparkMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [radius, setRadius] = useState(10)

  // Load nearby users
  useEffect(() => {
    loadNearbyUsers()
  }, [radius])

  // Load pending or accepted sparks
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingSparks()
    } else if (activeTab === 'accepted') {
      loadAcceptedSparks()
    }
  }, [activeTab])

  const loadNearbyUsers = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated')
      return
    }
    
    setIsLoading(true)
    try {
      const location = await geospatialService.getBrowserLocation();
      const { data } = await DiscoverAPI.nearby({ 
        radius, 
        latitude: location.latitude, 
        longitude: location.longitude 
      });
      if (data.success) {
        const usersWithDefaults = data.data.users.map((user: any) => ({
          ...user,
          common_interests: user.common_interests || [],
          common_attributes: user.common_attributes || [],
          interests: user.interests || []
        }));
        setNearbyUsers(usersWithDefaults);
      } else {
        setNearbyUsers([]);
      }
    } catch (error) {
      console.error('Error loading nearby users:', error);
      setNearbyUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingSparks = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated')
      return
    }
    
    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sparks/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        // Ensure arrays are defined
        const sparksWithDefaults = data.data.map((spark: any) => ({
          ...spark,
          sender_interests: spark.sender_interests || []
        }))
        setPendingSparks(sparksWithDefaults)
      }
    } catch (error) {
      console.error('Error loading pending sparks:', error)
    }
  }

  const loadAcceptedSparks = async () => {
    if (!isAuthenticated) return
    try {
      // Load accepted sparks
      const { data: sparksData } = await SparksAPI.getAll()
      if (sparksData.success) {
        const accepted = sparksData.data.filter((s: any) => s.status === 'accepted')
        // Load chat rooms to resolve chatId for each connection
        let chatsByParticipant: Record<string, number> = {}
        try {
          const chatRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/user/chats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const chatData = await chatRes.json()
          if (chatData.success) {
            // Map other_user_id -> chatId
            chatData.data.forEach((chat: any) => {
              const other = (chat.participants || []).find((p: any) => p.id !== user?.id)
              if (other) chatsByParticipant[other.id] = chat.id
            })
          }
        } catch {}

        const formatted = accepted.map((s: any) => {
          const isSender = s.sender_id === user?.id
          const otherUserId = isSender ? s.receiver_id : s.sender_id
          return {
            id: s.id,
            other_user_id: otherUserId,
            other_name: isSender ? s.receiver_name : s.sender_name,
            other_email: isSender ? s.receiver_email : s.sender_email,
            other_city: isSender ? s.receiver_city : s.sender_city,
            other_age: isSender ? s.receiver_age : s.sender_age,
            created_at: s.created_at,
            chatId: chatsByParticipant[otherUserId] || null,
          }
        })
        setAcceptedSparks(formatted)
      }
    } catch (error) {
      console.error('Error loading accepted sparks:', error)
    }
  }

  const sendSpark = async (receiverId: number, message: string) => {
    if (!isAuthenticated) {
      console.log('User not authenticated')
      return
    }
    
    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sparks/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Update the user's spark status
        setNearbyUsers(prev => prev.map(user => 
          user.id === receiverId 
            ? { ...user, hasSpark: true, sparkStatus: 'pending' }
            : user
        ))
        setSelectedUser(null)
        setSparkMessage('')
      }
    } catch (error) {
      console.error('Error sending spark:', error)
    }
  }

  const acceptSpark = async (sparkId: number) => {
    if (!isAuthenticated) return
    try {
      const { data } = await SparksAPI.accept(sparkId)
      if (data.success) {
        setPendingSparks(prev => prev.filter(spark => spark.id !== sparkId))
        const chatId = data.data?.chatId
        // Navigate directly to the new chat
        if (chatId) {
          router.push(`/chat?chatId=${chatId}`)
        } else {
          setActiveTab('accepted')
        }
      }
    } catch (error) {
      console.error('Error accepting spark:', error)
    }
  }

  const rejectSpark = async (sparkId: number) => {
    if (!isAuthenticated) {
      console.log('User not authenticated')
      return
    }
    
    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sparks/${sparkId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      if (data.success) {
        // Remove from pending sparks
        setPendingSparks(prev => prev.filter(spark => spark.id !== sparkId))
      }
    } catch (error) {
      console.error('Error rejecting spark:', error)
    }
  }

  const filteredNearbyUsers = nearbyUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.interests.some(interest => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const formatDistance = (distance: number | undefined) => {
    if (distance === undefined || distance === null) {
      return 'Distance unknown'
    }
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`
    }
    return `${distance.toFixed(1)}km away`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }


  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex absolute inset-0 top-16">
          <div className={`flex-1 flex flex-col absolute top-0 bottom-0 ${
            isCollapsed ? 'left-16' : 'left-64'
          } right-0`}>
            <div className="flex items-center justify-center h-full">
              <div className="card-surface p-8 text-center max-w-md">
                <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
                <p className="text-text-secondary mb-6">
                  You need to be logged in to use the Sparks feature. Please log in to continue.
                </p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="btn-primary"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-border-medium shadow-sm">
      {/* Header */}
      <div className="bg-surface/90 backdrop-blur-md border-b border-border-medium p-4">
        <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-primary" />
                  <span>Sparks</span>
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Connect with nearby people who share your interests
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-muted">Radius:</span>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="px-3 py-1.5 bg-surface border border-border-medium rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value={5}>5km</option>
                    <option value={10}>10km</option>
                    <option value={20}>20km</option>
                    <option value={50}>50km</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-surface/90 backdrop-blur-md border-b border-border-medium">
            <div className="flex">
              <button
                onClick={() => setActiveTab('nearby')}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'nearby'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Nearby People</span>
                {nearbyUsers.length > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {nearbyUsers.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pending Sparks</span>
                {pendingSparks.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingSparks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('accepted')}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'accepted'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Accepted Sparks</span>
                {acceptedSparks.length > 0 && (
                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                    {acceptedSparks.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-surface/90 backdrop-blur-md border-b border-border-medium p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder={activeTab === 'nearby' ? "Search nearby people..." : activeTab === 'pending' ? "Search pending sparks..." : "Search accepted sparks..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border-medium rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'nearby' && (
              <>
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-text-muted">Finding nearby people...</p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredNearbyUsers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2 text-text-primary">No nearby people found</h3>
                    <p className="text-text-muted mb-4">Try increasing the search radius or check back later</p>
                    <button 
                      onClick={() => setRadius(Math.min(radius + 10, 50))}
                      className="btn-primary"
                    >
                      Increase Radius
                    </button>
                  </div>
                )}

                {/* User Grid */}
                {!isLoading && filteredNearbyUsers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filteredNearbyUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="card-surface p-5 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-lg font-semibold text-white shadow-soft">
                          {user.name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-text-primary">{user.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-text-muted bg-hover-light px-2 py-1 rounded-full">
                              <MapPin className="w-3 h-3" />
                              <span>{formatDistance(user.distance_km)}</span>
                            </div>
                          </div>
                          <div className="text-sm text-text-muted">{user.city || 'Unknown location'}</div>
                        </div>
                        {/* Commonality Score Badge */}
                        <div className="flex items-center gap-1 text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-1 rounded-full font-medium">
                          <Heart className="w-3 h-3" />
                          <span>{user.commonality_score}%</span>
                        </div>
                      </div>
                      
                      {/* User Details */}
                      <div className="space-y-2 mb-4">
                        {user.school && (
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <School className="w-4 h-4" />
                            <span>{user.school}</span>
                          </div>
                        )}
                        {user.workplace && (
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Building className="w-4 h-4" />
                            <span>{user.workplace}</span>
                          </div>
                        )}
                        {user.interests && user.interests.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Heart className="w-4 h-4" />
                            <span>{user.interests.slice(0, 3).join(', ')}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Things you have in common */}
                      {(user.common_attributes && user.common_attributes.length > 0) || 
                       (user.common_interests && user.common_interests.length > 0) ? (
                        <div className="border-t border-border-light pt-4">
                          <div className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            Things you have in common
                          </div>
                          
                          {/* Common Attributes */}
                          {user.common_attributes && user.common_attributes.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-text-muted mb-2">Same attributes:</div>
                              <div className="flex flex-wrap gap-1">
                                {user.common_attributes.map((attr, idx) => (
                                  <span key={idx} className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                                    same {attr}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Common Interests */}
                          {user.common_interests && user.common_interests.length > 0 && (
                            <div>
                              <div className="text-xs text-text-muted mb-2">Shared interests:</div>
                              <div className="flex flex-wrap gap-1">
                                {user.common_interests.map((interest, idx) => (
                                  <span key={idx} className="px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div className="flex justify-between items-center">
                        {user.hasSpark ? (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.sparkStatus === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700'
                              : user.sparkStatus === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.sparkStatus === 'pending' ? 'Spark Sent' :
                             user.sparkStatus === 'accepted' ? 'Connected' : 'Rejected'}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedUser(user)
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Send Spark</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
              </>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-4">
                <AnimatePresence>
                  {pendingSparks.map((spark) => (
                    <motion.div
                      key={spark.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-surface border border-border-medium rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-primary">{spark.sender_name}</h3>
                            <p className="text-sm text-text-muted">{spark.sender_age} years old</p>
                            <p className="text-xs text-text-muted">{formatTimeAgo(spark.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {spark.sender_city && (
                        <div className="flex items-center space-x-1 mb-2">
                          <MapPin className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-text-muted">{spark.sender_city}</span>
                        </div>
                      )}

                      {spark.sender_interests && spark.sender_interests.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-text-muted mb-1">Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {spark.sender_interests.slice(0, 3).map((interest, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {spark.message && (
                        <div className="mb-3 p-3 bg-background rounded-lg">
                          <p className="text-sm text-text-primary">{spark.message}</p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptSpark(spark.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => rejectSpark(spark.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {pendingSparks.length === 0 && (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-primary mb-1">No Pending Sparks</h3>
                    <p className="text-sm text-text-secondary">When people send you sparks, they'll appear here</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'accepted' && (
              <div className="space-y-4">
                <AnimatePresence>
                  {acceptedSparks
                    .filter(spark => spark.other_name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((spark) => (
                    <motion.div
                      key={spark.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-surface border border-border-medium rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{spark.other_name}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mt-1">
                            {spark.other_age && <span>{spark.other_age} years old</span>}
                            {spark.other_age && spark.other_city && <span>•</span>}
                            {spark.other_city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {spark.other_city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-text-muted hidden md:inline">
                          Connected {formatTimeAgo(spark.created_at)}
                        </span>
                        <button
                          onClick={() => router.push(spark.chatId ? `/chat?chatId=${spark.chatId}` : '/chat')}
                          className="flex items-center space-x-1 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {acceptedSparks.length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-primary mb-1">No Accepted Sparks yet</h3>
                    <p className="text-sm text-text-secondary">Keep sending and accepting sparks to build connections!</p>
                  </div>
                )}
              </div>
            )}
          </div>


      {/* Spark Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-border-medium rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{selectedUser.name}</h3>
                  <p className="text-sm text-text-muted">{formatDistance(selectedUser.distance_km)}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={sparkMessage}
                  onChange={(e) => setSparkMessage(e.target.value)}
                  placeholder="Say hello and introduce yourself..."
                  className="w-full px-3 py-2 bg-background border border-border-medium rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setSparkMessage('')
                  }}
                  className="flex-1 px-4 py-2 border border-border-medium text-text-primary rounded-lg hover:bg-hover-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendSpark(selectedUser.id, sparkMessage)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Send Spark</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
