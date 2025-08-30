'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { DiscoverAPI } from '@/lib/api'
import { MapPin, Zap, User, School, Building, Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

// Dynamic import to prevent SSR issues
const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => (
    <div className="card-surface p-8">
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading map...</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gradient">
            Discover Nearby People
          </h1>
          <p className="text-text-secondary">Find people near you and see what you have in common</p>
        </div>
        
        {/* Radius Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm text-text-muted">Search Radius:</span>
          </div>
          <div className="flex gap-2 bg-hover-light p-1 rounded-xl border border-border-light">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  r === radius 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-hover-medium'
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-text-muted">Loading nearby users...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Map Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary">📍 Interactive Map</h2>
          <span className="text-sm text-text-muted">Click on markers to see user details</span>
        </div>
        <MapView users={mapUsers} className="" />
      </div>

      {/* User Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-surface p-4">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-sm text-text-muted">Nearby Users</div>
          </div>
          
          <div className="card-surface p-4">
            <div className="text-2xl font-bold text-accent">
              {users.filter(u => u.commonalities && (u.commonalities.attributes.length > 0 || u.commonalities.interests.length > 0)).length}
            </div>
            <div className="text-sm text-text-muted">With Commonalities</div>
          </div>
          
          <div className="card-surface p-4">
            <div className="text-2xl font-bold text-text-primary">{radius}km</div>
            <div className="text-sm text-text-muted">Search Radius</div>
          </div>

          <div className="card-surface p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.length > 0 ? Math.round((users.reduce((sum, u) => sum + (u.distance?.km || 0), 0) / users.length) * 100) / 100 : 0}
            </div>
            <div className="text-sm text-text-muted">Avg Distance (km)</div>
          </div>
        </div>
      )}

      {/* User List Section */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-text-primary">👥 Nearby People</h2>
            <span className="text-sm text-text-muted">{users.length} people found within {radius}km</span>
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2 text-text-primary">No nearby users found</h3>
          <p className="text-text-muted mb-4">Try increasing the search radius or check back later</p>
          <button 
            onClick={() => setRadius(Math.min(radius + 5, 50))}
            className="btn-primary"
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
    <div className="card-surface p-5 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] hover:border-primary/30">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-lg font-semibold text-white shadow-soft">
          {user.name?.[0] || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-text-primary">{user.name}</h3>
            {user?.distance?.km != null && (
              <div className="flex items-center gap-1 text-xs text-text-muted bg-hover-light px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                <span>{user.distance.km} km</span>
              </div>
            )}
          </div>
          <div className="text-sm text-text-muted">{user.city || 'Unknown location'}</div>
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
      {hasCommonalities && (
        <div className="border-t border-border-light pt-4">
          <div className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Things you have in common
          </div>
          
          {/* Common Attributes */}
          {commonAttributes.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-text-muted mb-2">Same attributes:</div>
              <div className="flex flex-wrap gap-1">
                {commonAttributes.map((attr, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                    same {attr}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Common Interests */}
          {commonInterests.length > 0 && (
            <div>
              <div className="text-xs text-text-muted mb-2">Shared interests:</div>
              <div className="flex flex-wrap gap-1">
                {commonInterests.map((interest, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-5">
        <button className="btn-primary w-full gap-2">
          <Zap className="w-4 h-4" />
          Send Spark
        </button>
      </div>
    </div>
  )
}
