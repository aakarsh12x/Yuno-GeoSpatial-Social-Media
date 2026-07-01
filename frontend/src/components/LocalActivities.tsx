'use client'

import { useState, useEffect } from 'react'
import { ActivitiesAPI, UserAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { 
  Utensils, Calendar, Palette, Trees, Moon, Users, 
  Cpu, Trophy, ShoppingBag, Newspaper, ExternalLink,
  RefreshCw, TrendingUp, Flame
} from 'lucide-react'
import { CelestialStar } from './VintageIcons'

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
  food: { icon: Utensils, color: 'text-orange-700', bg: 'bg-orange-50' },
  event: { icon: Calendar, color: 'text-blue-700', bg: 'bg-blue-50' },
  culture: { icon: Palette, color: 'text-purple-700', bg: 'bg-purple-50' },
  outdoors: { icon: Trees, color: 'text-green-700', bg: 'bg-green-50' },
  nightlife: { icon: Moon, color: 'text-indigo-700', bg: 'bg-indigo-50' },
  community: { icon: Users, color: 'text-teal-700', bg: 'bg-teal-50' },
  tech: { icon: Cpu, color: 'text-sky-700', bg: 'bg-sky-50' },
  sports: { icon: Trophy, color: 'text-amber-700', bg: 'bg-amber-50' },
  shopping: { icon: ShoppingBag, color: 'text-pink-700', bg: 'bg-pink-50' },
  news: { icon: Newspaper, color: 'text-slate-700', bg: 'bg-slate-50' },
}

const vibeLabels: Record<string, string> = {
  chill: '😌 Chill',
  energetic: '⚡ Energetic',
  intellectual: '🧠 Intellectual',
  social: '🤝 Social',
  adventurous: '🏔️ Adventurous',
  cozy: '☕ Cozy',
}

export default function LocalActivities() {
  const { user, updateUser } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [city, setCity] = useState('')

  const fetchActivities = async () => {
    setLoading(true)
    setError('')
    try {
      let resolvedCity = '';

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
          
          // 2. Reverse geocode via Nominatim
          const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`;
          const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'YunoApp/1.0' } });
          const geoData = await geoRes.json();
          const parsedCity = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.suburb || geoData.address?.state_district || '';
          if (parsedCity) {
            resolvedCity = parsedCity;
            localStorage.setItem('yuno_cached_city', parsedCity);
            updateUser({ city: parsedCity });
            // Dynamic update user profile in background
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

      const { data } = await ActivitiesAPI.getLocal(resolvedCity)
      if (data.success) {
        setActivities(data.data.activities || [])
        setCity(data.data.city || resolvedCity)
      }
    } catch (err: any) {
      console.error('Error loading activities:', err)
      setError('Could not load local activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchActivities()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CelestialStar className="w-5 h-5 text-[#D4453A]" />
          <h2 className="text-xl font-bold text-text-primary">What's Happening Nearby</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-surface p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-hover-light" />
                <div className="flex-1">
                  <div className="h-3 bg-hover-light rounded w-3/4 mb-2" />
                  <div className="h-2 bg-hover-light rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-hover-light rounded w-full mb-1.5" />
              <div className="h-2 bg-hover-light rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-text-muted text-sm mb-3">{error}</p>
        <button onClick={fetchActivities} className="text-primary text-sm font-semibold hover:underline">
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EDE7E0] border border-[#D4C3B3]/45 rounded-lg flex items-center justify-center">
            <CelestialStar className="w-5 h-5 text-[#D4453A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">What's Happening Nearby</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-wider">
                <Flame className="w-3 h-3" />
                Live Feed
              </span>
            </div>
            <p className="text-sm text-text-muted mt-0.5 font-medium">
              Daily curated briefing for {city} · Discover local culture and conversations
            </p>
          </div>
        </div>
        <button 
          onClick={fetchActivities}
          className="p-2.5 text-text-muted hover:text-primary hover:bg-hover-light rounded-xl transition-all border border-border-light hover:border-primary/20 bg-white shadow-sm"
          title="Refresh activities"
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
              className={`bg-white border border-border-light rounded-xl p-5 hover:border-border-medium hover:shadow-soft transition-all duration-300 group flex flex-col justify-between ${
                isFeatured ? 'md:col-span-2 shadow-soft border-border-medium/80 min-h-[180px]' : 'min-h-[160px]'
              }`}
            >
              <div>
                {/* Top Row: Category + Vibe */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md ${config.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                      {activity.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {vibeLabels[activity.vibe] || activity.vibe}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-text-primary leading-snug mb-2 line-clamp-2 ${
                  isFeatured ? 'text-base md:text-lg' : 'text-sm'
                }`}>
                  {activity.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">
                  {activity.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border-light mt-auto">
                <div className="flex items-center gap-3">
                  {activity.subreddit && (
                    <span className="text-[10px] text-text-muted font-medium">
                      r/{activity.subreddit}
                    </span>
                  )}
                  {activity.score > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-text-muted">
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
                    className="text-text-muted hover:text-primary transition-colors inline-flex items-center gap-1 text-xs"
                  >
                    {isFeatured && <span className="font-medium">View thread</span>}
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
