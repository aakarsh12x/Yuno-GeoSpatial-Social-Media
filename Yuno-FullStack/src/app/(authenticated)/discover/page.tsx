'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DiscoverAPI } from '@/lib/api'
import { geospatialService } from '@/lib/geospatialService'
import { useAuth } from '@/context/AuthContext'
import { Map, Zap, MapPin, Wifi, WifiOff } from 'lucide-react'
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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await DiscoverAPI.nearby({ radius })
        setUsers(data.data.users || [])
      } catch (e: unknown) {
        const errorMessage = e && typeof e === 'object' && 'response' in e 
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
    if (!user) return;

    const initializeRealTimeDiscovery = async () => {
      try {
        // Connect to geospatial service
        geospatialService.connect();

        // Set up callbacks
        geospatialService.onNearbyUsersUpdateCallback((nearbyUsers) => {
          const realTimeUsers = nearbyUsers.map(nearbyUser => ({
            id: nearbyUser.userId,
            name: nearbyUser.userData.name,
            city: nearbyUser.userData.city,
            distance: { km: nearbyUser.distance, miles: nearbyUser.distance * 0.621371 },
            commonalities: {
              attributes: [],
              interests: nearbyUser.userData.interests
            }
          }));
          setUsers(realTimeUsers);
          setIsRealTime(true);
        });

        geospatialService.onNewUserNearbyCallback((newUser) => {
          console.log('New user nearby:', newUser.userData.name);
          // Add to existing users list
          setUsers(prev => [...prev, {
            id: newUser.userId,
            name: newUser.userData.name,
            city: newUser.userData.city,
            distance: { km: newUser.distance, miles: newUser.distance * 0.621371 },
            commonalities: {
              attributes: [],
              interests: newUser.userData.interests
            }
          }]);
          
          // Show notification
          setNotification({
            message: 'New person nearby!',
            userData: {
              name: newUser.userData.name,
              city: newUser.userData.city,
              distance: newUser.distance
            }
          });
        });

        // Check location permission
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermission(permission.state);
          
          permission.onchange = () => {
            setLocationPermission(permission.state);
          };
        }

        // Start location tracking if permission granted
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
              interests: user.interests
            },
            30000 // Update every 30 seconds
          );

          // Discover nearby users
          try {
            const location = await geospatialService.getBrowserLocation();
            geospatialService.discoverNearby(location.latitude, location.longitude, radius);
          } catch (error) {
            console.error('Failed to get location:', error);
          }

          return () => {
            stopTracking();
            geospatialService.disconnect();
          };
        }
      } catch (error) {
        console.error('Failed to initialize real-time discovery:', error);
      }
    };

    initializeRealTimeDiscovery();
  }, [user, radius, locationPermission]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Discover</h1>
          <Link href="/map" className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm transition-colors">
            <Map className="w-4 h-4" />
            Map View
          </Link>
          
          {/* Real-time Status Indicator */}
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
        <div className="flex items-center gap-2">
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
      </div>

      {loading && <div className="text-gray-400">Loading nearby users...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {/* Real-time Notification */}
      {notification && (
        <RealTimeNotification
          message={notification.message}
          userData={notification.userData}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <ProfileCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}

function ProfileCard({ user }: { user: User }) {
  const highlights = [
    ...(user?.commonalities?.attributes || []).map((a) => `same ${a}`),
    ...(user?.commonalities?.interests || [])
  ].slice(0, 4)

  return (
    <div className="bg-surface/60 backdrop-blur rounded-2xl p-5 border border-white/10 hover:shadow-glow transition-shadow">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-lg font-semibold">
          {user.name?.[0] || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{user.name}</h3>
            {user?.distance?.km != null && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{user.distance.km} km</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">{user.city || 'Unknown'}</div>
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
        <button className="btn-primary w-full gap-2">
          <Zap className="w-4 h-4" />
          Send Spark
        </button>
      </div>
    </div>
  )
}
