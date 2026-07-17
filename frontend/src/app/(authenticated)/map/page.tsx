'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { DiscoverAPI } from '@/lib/api'
import { MapPin, Zap, User, School, Building, Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

// Dynamic import to prevent SSR issues
const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => (
    <div className="yuno-card p-8">
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b5511b] mx-auto mb-4"></div>
          <p className="text-[#54433a]/80">Loading map...</p>
        </div>
      </div>
    </div>
  )
})

interface User {
  id: number
  name: string
  city?: string
  school?: string
  workplace?: string
  interests?: string[]
  latitude?: number
  longitude?: number
  distance?: { km: number; miles: number }
  commonalities?: {
    attributes: string[]
    interests: string[]
  }
}

export default function MapPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [radius, setRadius] = useState(10)

  useEffect(() => {
    const loadUsers = async () => {
      if (!user) return
      
      setLoading(true)
      setError('')
      try {
        // Use user's location if available, otherwise use default
        const params: any = { radius }
        if (user.latitude && user.longitude) {
          params.latitude = user.latitude
          params.longitude = user.longitude
        }
        
        const { data } = await DiscoverAPI.nearby(params)
        setUsers(data.data.users || [])
      } catch (e: unknown) {
        const errorMessage = e && typeof e === 'object' && 'response' in e 
          ? (e.response as { data?: { message?: string } })?.data?.message || 'Failed to load nearby users'
          : 'Failed to load nearby users'
        setError(errorMessage)
        console.error('Error loading users:', e)
      } finally {
        setLoading(false)
      }
    }
    
    // Load once immediately when component mounts or dependencies change
    loadUsers()
  }, [radius, user])

  // Convert users to map format using real coordinates from backend
  const mapUsers = users.map(user => {
    const commonalities = [
      ...(user.commonalities?.attributes || []).map(attr => `same ${attr}`),
      ...(user.commonalities?.interests || [])
    ]

    return {
      id: user.id,
      name: user.name,
      lat: user.latitude || 23.2257, // Use real latitude from backend, fallback to Bhopal
      lng: user.longitude || 77.3867, // Use real longitude from backend, fallback to Bhopal
      common: commonalities,
      distance: user.distance?.km
    }
  })

  const radiusOptions = [5, 10, 20]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-[#231b15] tracking-tight font-display italic font-medium">
            Discover Nearby Connections
          </h1>
          <p className="text-[#54433a]/80 font-medium">Find people near you and see what you have in common</p>
        </div>
        
        {/* Radius Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#b5511b]" />
            <span className="text-sm text-[#54433a]/80">Search Radius:</span>
          </div>
          <div className="flex gap-2 bg-white/80 p-1 rounded-xl border border-[#e0d7d0] backdrop-blur-md">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors font-medium ${
                  r === radius 
                    ? 'bg-[#b5511b] text-white shadow-sm' 
                    : 'text-[#54433a] hover:bg-white/15'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#b5511b] mx-auto mb-2"></div>
          <p className="text-[#54433a]/80">Loading nearby users...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Map Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl text-[#231b15] font-display italic font-medium">📍 Interactive Map</h2>
          <span className="text-sm text-[#54433a]/70">Click on markers to see user details</span>
        </div>
        <Suspense fallback={
          <div className="yuno-card p-8">
            <div className="flex items-center justify-center h-[500px]">
              <p className="text-[#54433a]/80">Loading map viewport...</p>
            </div>
          </div>
        }>
          <MapView users={mapUsers} className="" />
        </Suspense>
      </div>

      {/* User Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="yuno-card p-4">
            <div className="text-2xl font-bold text-[#b5511b]">{users.length}</div>
            <div className="text-sm text-[#54433a]/80">Nearby Users</div>
          </div>
          
          <div className="yuno-card p-4">
            <div className="text-2xl font-bold text-[#b5511b]">
              {users.filter(u => u.commonalities && (u.commonalities.attributes.length > 0 || u.commonalities.interests.length > 0)).length}
            </div>
            <div className="text-sm text-[#54433a]/80">With Commonalities</div>
          </div>
          
          <div className="yuno-card p-4">
            <div className="text-2xl font-bold text-[#231b15]">{radius}km</div>
            <div className="text-sm text-[#54433a]/80">Search Radius</div>
          </div>
 
          <div className="yuno-card p-4">
            <div className="text-2xl font-bold text-green-700">
              {users.length > 0 ? Math.round((users.reduce((sum, u) => sum + (u.distance?.km || 0), 0) / users.length) * 100) / 100 : 0}
            </div>
            <div className="text-sm text-[#54433a]/80">Avg Distance (km)</div>
          </div>
        </div>
      )}

      {/* User List Section */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl text-[#231b15] font-display italic font-medium">👥 Nearby People</h2>
            <span className="text-sm text-[#54433a]/80">{users.length} people found within {radius}km</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <ProfileCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="text-center py-12 yuno-card p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold mb-2 text-[#231b15]">No nearby users found</h3>
          <p className="text-xs text-[#54433a]/80 mb-6">Try increasing the search radius or check back later</p>
          <button 
            onClick={() => setRadius(Math.min(radius + 5, 50))}
            className="inline-flex items-center gap-2 bg-[#b5511b] hover:bg-[#943b0d] text-white px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all"
          >
            Increase Radius
          </button>
        </div>
      )}
    </div>
  )
}

function ProfileCard({ user }: { user: User }) {
  const commonAttributes = user?.commonalities?.attributes || []
  const commonInterests = user?.commonalities?.interests || []
  const hasCommonalities = commonAttributes.length > 0 || commonInterests.length > 0

  return (
    <div className="yuno-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-[#b5511b]/20 border border-[#b5511b]/35 flex items-center justify-center text-base font-bold text-[#b5511b] shadow-sm shrink-0">
            {user.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#231b15] truncate">{user.name}</h3>
              {user?.distance?.km != null && (
                <div className="flex items-center gap-1 text-[10px] text-[#54433a]/90 bg-white/60 border border-[#e0d7d0] px-2 py-0.5 rounded-full shrink-0">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{user.distance.km} km</span>
                </div>
              )}
            </div>
            <div className="text-xs text-[#54433a]/80 truncate">{user.city || 'Unknown location'}</div>
          </div>
        </div>
        
        {/* User Details */}
        <div className="space-y-1.5 mb-4">
          {user.school && (
            <div className="flex items-center gap-2 text-xs text-[#54433a]/80">
              <School className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.school}</span>
            </div>
          )}
          {user.workplace && (
            <div className="flex items-center gap-2 text-xs text-[#54433a]/80">
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.workplace}</span>
            </div>
          )}
          {user.interests && user.interests.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#54433a]/80">
              <Heart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.interests.slice(0, 3).join(', ')}</span>
            </div>
          )}
        </div>
        
        {/* Things you have in common */}
        {hasCommonalities && (
          <div className="border-t border-[#5d4037]/10 pt-4 mb-4">
            <div className="text-xs font-bold text-[#231b15] mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#b5511b]" />
              Things you have in common
            </div>
            
            {/* Common Attributes */}
            {commonAttributes.length > 0 && (
              <div className="mb-3">
                <div className="text-[10px] text-[#54433a]/75 mb-1.5 font-mono uppercase">Same attributes:</div>
                <div className="flex flex-wrap gap-1">
                  {commonAttributes.map((attr, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#b5511b]/10 border border-[#b5511b]/20 text-[#b5511b] text-[9px] font-bold uppercase tracking-wider font-mono">
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Common Interests */}
            {commonInterests.length > 0 && (
              <div>
                <div className="text-[10px] text-[#54433a]/75 mb-1.5 font-mono uppercase">Shared interests:</div>
                <div className="flex flex-wrap gap-1">
                  {commonInterests.map((interest, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#b5511b] text-white text-[9px] font-bold uppercase tracking-wider font-mono">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-auto pt-2">
        <button className="w-full flex items-center justify-center gap-2 py-2 bg-[#b5511b] hover:bg-[#943b0d] text-white rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200">
          <Zap className="w-3.5 h-3.5" />
          Send Spark
        </button>
      </div>
    </div>
  )
}
