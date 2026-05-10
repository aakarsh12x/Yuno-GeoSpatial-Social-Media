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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Discover</h1>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm transition-colors"
          >
            <Map className="w-4 h-4" />
            Map View
          </Link>

          <div className="flex items-center gap-2">
            {isRealTime ? (
              <div className="flex items-center gap-1 text-green-500">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
            {locationPermission === 'denied' && (
              <div className="flex items-center gap-1 text-red-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Location Denied</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {radiusOptions.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded-lg text-sm ${
                r === radius ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-gray-400">Loading nearby users...</div>}
      {error && <div className="text-red-400">{error}</div>}

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
              className="bg-surface/60 backdrop-blur rounded-2xl p-5 border border-white/10 hover:shadow-glow transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-lg font-semibold text-white">
                  {u.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{u.name}</h3>
                    {u?.distance?.km != null && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>{u.distance.km} km</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{u.city || 'Unknown'}</div>
                </div>
              </div>

              {highlights.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-300 mb-2">You both have</div>
                  <div className="flex flex-wrap gap-2">
                    {highlights.map((h, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                {alreadySent ? (
                  <div className="w-full text-center py-2 rounded-xl bg-green-500/15 text-green-400 text-sm font-medium border border-green-500/20">
                    ⚡ Spark Sent!
                  </div>
                ) : (
                  <button
                    onClick={() => setSparkTarget(u)}
                    className="btn-primary w-full gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Send Spark
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Send Spark Modal */}
      {sparkTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-lg font-semibold text-white">
                  {sparkTarget.name?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{sparkTarget.name}</h3>
                  <p className="text-sm text-text-muted">{sparkTarget.city || 'Nearby'}</p>
                </div>
              </div>
              <button
                onClick={() => { setSparkTarget(null); setSparkMessage('') }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Message <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={sparkMessage}
                onChange={(e) => setSparkMessage(e.target.value)}
                placeholder="Say hello and introduce yourself..."
                className="w-full px-3 py-2 bg-background border border-border-medium rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                rows={3}
                disabled={sparkSending}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setSparkTarget(null); setSparkMessage('') }}
                disabled={sparkSending}
                className="flex-1 px-4 py-2 border border-border-medium text-text-primary rounded-lg hover:bg-hover-light transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSpark}
                disabled={sparkSending}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {sparkSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Send Spark
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
