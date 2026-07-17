'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DiscoverAPI, SparksAPI } from '@/lib/api'
import { geospatialService } from '@/lib/geospatialService'
import { useAuth } from '@/context/AuthContext'
import { Map, Zap, MapPin, Wifi, WifiOff, X } from 'lucide-react'
import RealTimeNotification from '@/components/RealTimeNotification'

interface User {
  id: number
  name: string
  city?: string
  distance?: { km: number; miles: number }
  commonalities?: {
    attributes: string[]
    interests: string[]
  }
}

const radiusOptions = [5, 10, 20]

export default function DiscoverPage() {
  const { user } = useAuth()
  const [radius, setRadius] = useState(20)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRealTime, setIsRealTime] = useState(false)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [notification, setNotification] = useState<{
    message: string
    userData?: { name: string; city: string; distance: number }
  } | null>(null)

  // Spark modal state (lifted to page level so it overlays the whole page correctly)
  const [sparkTarget, setSparkTarget] = useState<User | null>(null)
  const [sparkMessage, setSparkMessage] = useState('')
  const [sparkSending, setSparkSending] = useState(false)
  const [sentIds, setSentIds] = useState<number[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const location = await geospatialService.getBrowserLocation()
        const { data } = await DiscoverAPI.nearby({
          radius,
          latitude: location.latitude,
          longitude: location.longitude,
        })
        setUsers(data.data.users || [])
      } catch (e: unknown) {
        const errorMessage =
          e && typeof e === 'object' && 'response' in e
            ? (e.response as { data?: { message?: string } })?.data?.message || 'Failed to load'
            : 'Failed to load'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [radius])

  // Real-time geospatial discovery
  useEffect(() => {
    if (!user) return

    const initializeRealTimeDiscovery = async () => {
      try {
        geospatialService.connect()

        geospatialService.onNearbyUsersUpdateCallback((nearbyUsers) => {
          const realTimeUsers = nearbyUsers.map((nearbyUser) => ({
            id: nearbyUser.userId,
            name: nearbyUser.userData.name,
            city: nearbyUser.userData.city,
            distance: { km: nearbyUser.distance, miles: nearbyUser.distance * 0.621371 },
            commonalities: { attributes: [], interests: nearbyUser.userData.interests },
          }))
          setUsers(realTimeUsers)
          setIsRealTime(true)
        })

        geospatialService.onNewUserNearbyCallback((newUser) => {
          setUsers((prev) => [
            ...prev,
            {
              id: newUser.userId,
              name: newUser.userData.name,
              city: newUser.userData.city,
              distance: { km: newUser.distance, miles: newUser.distance * 0.621371 },
              commonalities: { attributes: [], interests: newUser.userData.interests },
            },
          ])
          setNotification({
            message: 'New person nearby!',
            userData: { name: newUser.userData.name, city: newUser.userData.city, distance: newUser.distance },
          })
        })

        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setLocationPermission(permission.state)
          permission.onchange = () => setLocationPermission(permission.state)
        }

        if (locationPermission === 'granted') {
          const stopTracking = geospatialService.startLocationTracking(
            user.id,
            {
              id: user.id,
              name: user.name,
              email: user.email,
              age: user.age,
              city: user.city,
              school: user.school,
              college: user.college,
              workplace: user.workplace,
              interests: user.interests,
            },
            30000
          )

          try {
            const location = await geospatialService.getBrowserLocation()
            geospatialService.discoverNearby(location.latitude, location.longitude, radius)
          } catch (err) {
            console.error('Failed to get location:', err)
          }

          return () => {
            stopTracking()
            geospatialService.disconnect()
          }
        }
      } catch (err) {
        console.error('Failed to initialize real-time discovery:', err)
      }
    }

    initializeRealTimeDiscovery()
  }, [user, radius, locationPermission])

  const handleSendSpark = async () => {
    if (!sparkTarget) return
    setSparkSending(true)
    try {
      await SparksAPI.send(sparkTarget.id, sparkMessage || undefined)
      setSentIds((prev) => [...prev, sparkTarget.id])
      setSparkTarget(null)
      setSparkMessage('')
    } catch {
      // keep modal open on error
    } finally {
      setSparkSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl text-[#231b15] font-display italic font-medium">Discover</h1>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#b5511b]/10 border border-[#b5511b]/20 hover:bg-[#b5511b]/20 text-[#b5511b] rounded-lg text-sm transition-all font-semibold shadow-sm"
          >
            <Map className="w-4 h-4" />
            Map View
          </Link>

          <div className="flex items-center gap-2">
            {isRealTime ? (
              <div className="flex items-center gap-1.5 text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <Wifi className="w-3.5 h-3.5" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#54433a]/60 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </div>
            )}
            {locationPermission === 'denied' && (
              <div className="flex items-center gap-1.5 text-red-600 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location Denied</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 bg-white/80 p-1 rounded-xl border border-[#e0d7d0] shadow-sm self-start sm:self-auto">
          {radiusOptions.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                r === radius 
                  ? 'bg-[#b5511b] text-white shadow-sm font-semibold' 
                  : 'text-[#54433a] hover:bg-white/10'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b5511b] mx-auto mb-3"></div>
            <p className="text-[#54433a]/80 text-sm font-medium">Finding nearby people...</p>
          </div>
        </div>
      )}
      {error && <div className="text-red-500 text-sm font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</div>}

      {notification && (
        <RealTimeNotification
          message={notification.message}
          userData={notification.userData}
          onClose={() => setNotification(null)}
        />
      )}

      {/* User Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const highlights = [
            ...(u?.commonalities?.attributes || []).map((a) => `same ${a}`),
            ...(u?.commonalities?.interests || []),
          ].slice(0, 4)
          const alreadySent = sentIds.includes(u.id)

          return (
            <div
              key={u.id}
              className="yuno-card p-5 hover:scale-[1.01] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#b5511b]/20 border border-[#b5511b]/35 grid place-items-center text-lg font-bold text-[#b5511b] shadow-sm shrink-0">
                    {u.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#231b15] truncate">{u.name}</h3>
                      {u?.distance?.km != null && (
                        <div className="flex items-center gap-1 text-[10px] text-[#54433a]/90 bg-white/60 border border-[#e0d7d0] px-2 py-0.5 rounded-full shrink-0 font-medium">
                          <span>{u.distance.km.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-[#54433a]/80 truncate">{u.city || 'Unknown'}</div>
                  </div>
                </div>

                {highlights.length > 0 && (
                  <div className="mt-4 border-t border-[#5d4037]/10 pt-3">
                    <div className="text-xs font-bold text-[#231b15] mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#b5511b]" />
                      <span>Shared details</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {highlights.map((h, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#b5511b]/15 border border-[#b5511b]/25 text-[#b5511b] text-[9px] font-bold uppercase tracking-wider font-mono">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                {alreadySent ? (
                  <div className="w-full text-center py-2 rounded-xl bg-green-500/10 text-green-700 border border-green-500/20 text-xs font-bold uppercase tracking-wide">
                    ⚡ Spark Sent!
                  </div>
                ) : (
                  <button
                    onClick={() => setSparkTarget(u)}
                    className="w-full py-2 bg-[#b5511b] hover:bg-[#943b0d] text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Send Spark</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Send Spark Modal */}
      {sparkTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#fffdfb]/95 border border-[#e0d7d0] rounded-2xl p-6 max-w-sm w-full shadow-[0_12px_40px_rgba(93,64,55,0.12)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#b5511b]/20 border border-[#b5511b]/35 grid place-items-center text-lg font-bold text-[#b5511b]">
                  {sparkTarget.name?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-[#231b15]">{sparkTarget.name}</h3>
                  <p className="text-xs text-[#54433a]/80">{sparkTarget.city || 'Nearby'}</p>
                </div>
              </div>
              <button
                onClick={() => { setSparkTarget(null); setSparkMessage('') }}
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-[#54433a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#231b15] uppercase tracking-wider mb-2">
                Message <span className="text-[#54433a]/65 font-normal">(optional)</span>
              </label>
              <textarea
                value={sparkMessage}
                onChange={(e) => setSparkMessage(e.target.value)}
                placeholder="Say hello and introduce yourself..."
                className="w-full px-3 py-2 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 resize-none text-sm"
                rows={3}
                disabled={sparkSending}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setSparkTarget(null); setSparkMessage('') }}
                disabled={sparkSending}
                className="flex-1 px-4 py-2 border border-[#e0d7d0] text-[#231b15] hover:bg-[#5d4037]/5 bg-white/40 rounded-lg transition-colors font-mono uppercase tracking-wider text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSpark}
                disabled={sparkSending}
                className="flex-1 px-4 py-2 bg-[#b5511b] hover:bg-[#943b0d] text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider font-bold shadow-sm disabled:opacity-60"
              >
                {sparkSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Send Spark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

