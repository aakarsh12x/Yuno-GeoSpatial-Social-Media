'use client'

import { useState, useEffect } from 'react'
import { ActivitiesAPI, UserAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { 
  Utensils, Calendar, Palette, Trees, Moon, Users, 
  Cpu, Trophy, ShoppingBag, Newspaper, ExternalLink,
  RefreshCw, TrendingUp, Flame, Sparkles
} from 'lucide-react'

interface Activity {
  title: string
  description: string
  category: string
  vibe: string
  relevance: number
  permalink: string | null
  score: number
  subreddit: string | null
  thumbnail: string | null
}

const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
  food: { icon: Utensils, color: 'text-[#b5511b]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  event: { icon: Calendar, color: 'text-[#506680]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  culture: { icon: Palette, color: 'text-[#8b5a2b]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  outdoors: { icon: Trees, color: 'text-[#4e6b52]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  nightlife: { icon: Moon, color: 'text-[#483d8b]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  community: { icon: Users, color: 'text-[#a0522d]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  tech: { icon: Cpu, color: 'text-[#5f9ea0]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  sports: { icon: Trophy, color: 'text-[#b8860b]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  shopping: { icon: ShoppingBag, color: 'text-[#bc8f8f]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
  news: { icon: Newspaper, color: 'text-[#5d4037]', bg: 'bg-[#f5f2ee] border border-[#e0d7d0]' },
}

const vibeLabels: Record<string, string> = {
  chill: '😌 Chill',
  energetic: '⚡ Energetic',
  intellectual: '🧠 Intellectual',
  social: '🤝 Social',
  adventurous: '🏔️ Adventurous',
  cozy: '☕ Cozy',
}

const ACTIVITIES_CACHE_KEY = 'yuno_cached_activities'
const ACTIVITIES_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

function readCache(): { activities: Activity[]; city: string } | null {
  try {
    const raw = localStorage.getItem(ACTIVITIES_CACHE_KEY)
    if (!raw) return null
    const { activities, city, ts } = JSON.parse(raw)
    if (Date.now() - ts > ACTIVITIES_CACHE_TTL) return null // stale
    return { activities, city }
  } catch {
    return null
  }
}

function writeCache(activities: Activity[], city: string) {
  try {
    localStorage.setItem(
      ACTIVITIES_CACHE_KEY,
      JSON.stringify({ activities, city, ts: Date.now() })
    )
  } catch {}
}

export default function LocalActivities() {
  const { user, updateUser } = useAuth()

  // Seed state from cache immediately — no flicker / spinner on revisit
  const cached = typeof window !== 'undefined' ? readCache() : null
  const [activities, setActivities] = useState<Activity[]>(cached?.activities ?? [])
  const [loading, setLoading] = useState(!cached) // skip loading if cache hit
  const [error, setError] = useState('')
  const [city, setCity] = useState(cached?.city ?? '')

  const fetchActivities = async (force = false) => {
    // If not forced (manual refresh), check cache first
    if (!force) {
      const hit = readCache()
      if (hit) {
        setActivities(hit.activities)
        setCity(hit.city)
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError('')
    try {
      let resolvedCity = ''
      let resolvedLat: number | undefined
      let resolvedLng: number | undefined

      // 1. Try to get geolocation
      if ('geolocation' in navigator) {
        try {
          const coords = await new Promise<GeolocationCoordinates>((res, rej) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => res(pos.coords),
              (err) => rej(err),
              { timeout: 6000, enableHighAccuracy: false }
            );
          });

          resolvedLat = coords.latitude
          resolvedLng = coords.longitude

          // 2. Reverse geocode via Nominatim
          const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`;
          const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'YunoApp/1.0' } });
          const geoData = await geoRes.json();
          const parsedCity = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.suburb || geoData.address?.state_district || '';
          if (parsedCity) {
            resolvedCity = parsedCity;
            localStorage.setItem('yuno_cached_city', parsedCity);
            updateUser({ city: parsedCity });
            UserAPI.updateProfile({ city: parsedCity }).catch(() => {});
          }
        } catch (e) {
          console.log('Home geolocation failed, falling back to cache/profile:', e);
        }
      }

      // Fallbacks
      if (!resolvedCity) {
        resolvedCity = localStorage.getItem('yuno_cached_city') || user?.city || 'Mumbai';
      }

      setCity(resolvedCity);

      const { data } = await ActivitiesAPI.getLocal(resolvedCity, resolvedLat, resolvedLng)
      if (data.success) {
        const fetched = data.data.activities || []
        const finalCity = data.data.city || resolvedCity
        setActivities(fetched)
        setCity(finalCity)
        writeCache(fetched, finalCity) // persist for next visit
      }
    } catch (err: any) {
      console.error('Error loading activities:', err)
      setError('Could not load local activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchActivities() // uses cache if fresh
  }, [user])


  if (loading) {
    return (
      <div className="space-y-4 font-sans">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#b5511b]" />
          <h2 className="text-xl text-[#231b15] font-display italic font-medium">What's Happening Nearby</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="yuno-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/30" />
                <div className="flex-1">
                  <div className="h-3 bg-white/20 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-white/20 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded w-full mb-1.5" />
              <div className="h-2 bg-white/20 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="yuno-card p-6 text-center">
        <p className="text-[#54433a]/80 text-sm mb-3">{error}</p>
        <button onClick={() => fetchActivities(true)} className="text-[#b5511b] text-sm font-semibold hover:underline">
          Try again
        </button>
      </div>
    )
  }

  if (activities.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 font-sans">
          <div className="p-2 bg-white/80 border border-[#e0d7d0] rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#b5511b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl text-[#231b15] tracking-tight font-display italic font-medium">What's Happening Nearby</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#b5511b]/10 border border-[#b5511b]/20 text-[#b5511b] text-[9px] font-bold uppercase tracking-wider">
                <Flame className="w-3 h-3" />
                Live Feed
              </span>
            </div>
            <p className="text-sm text-[#54433a]/80 mt-0.5 font-medium">
              Daily curated briefing for {city} · Discover local culture and conversations
            </p>
          </div>
        </div>
        <button 
          onClick={() => fetchActivities(true)}
          className="p-2.5 text-[#54433a] hover:text-[#5d4037] hover:bg-[#5d4037]/5 rounded-xl transition-all border border-[#e0d7d0] bg-white/80 shadow-sm"
          title="Refresh activities (force fetch)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity, idx) => {
          const config = categoryConfig[activity.category] || categoryConfig.community
          const Icon = config.icon
          const isFeatured = idx === 0 && activities.length > 1

          return (
            <div
              key={idx}
              className={`yuno-card p-5 group flex flex-col justify-between ${
                isFeatured ? 'md:col-span-2 shadow-md min-h-[180px]' : 'min-h-[160px]'
              }`}
            >
              <div>
                {/* Top Row: Category + Vibe */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5f2ee] border border-[#e0d7d0]">
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#3e2723] font-bold">
                      {activity.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#5d4037]/5 border border-[#5d4037]/10 text-[#5d4037] text-[10px] font-medium font-sans">
                    {vibeLabels[activity.vibe] || activity.vibe}
                  </div>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-[#231b15] leading-snug mb-2 line-clamp-2 ${
                  isFeatured ? 'text-base md:text-lg' : 'text-sm'
                }`}>
                  {activity.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#54433a]/80 leading-relaxed mb-4 line-clamp-2">
                  {activity.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-3">
                  {activity.subreddit ? (
                    <span className="text-[10px] text-[#54433a]/60 font-medium">
                      r/{activity.subreddit}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">
                      📍 Nearby
                    </span>
                  )}
                  {activity.score > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-[#54433a]/60">
                      <TrendingUp className="w-3 h-3" />
                      {activity.score > 999 ? `${(activity.score / 1000).toFixed(1)}k` : activity.score} trending
                    </span>
                  )}
                </div>
                {activity.permalink && (
                  <a
                    href={activity.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#54433a] hover:text-[#b5511b] transition-colors inline-flex items-center gap-1 text-xs"
                  >
                    {isFeatured && (
                      <span className="font-medium">
                        {activity.subreddit ? 'View thread' : 'Visit site'}
                      </span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
