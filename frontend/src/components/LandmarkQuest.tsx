'use client'

import { useState, useEffect } from 'react'
import { VibeAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { MapPin, Target, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LandmarkQuestData {
  name: string
  type: string
  latitude: number
  longitude: number
  questText: string
}

export default function LandmarkQuest() {
  const { user } = useAuth()
  const [data, setData] = useState<LandmarkQuestData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchQuest = async (lat: number, lng: number, city: string) => {
    setLoading(true)
    try {
      const res = await VibeAPI.getLandmarkQuest(lat, lng, city)
      if (res.data?.success) {
        setData(res.data.data)
        try {
          localStorage.setItem('yuno_quest_cache', JSON.stringify({
            data: res.data.data,
            timestamp: Date.now()
          }))
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error fetching landmark quest:', e)
    } finally {
      setLoading(false)
    }
  }

  const triggerFetch = (force = false) => {
    if (!user) return

    if (!force) {
      const cachedQuest = localStorage.getItem('yuno_quest_cache')
      if (cachedQuest) {
        try {
          const parsed = JSON.parse(cachedQuest)
          const age = Date.now() - parsed.timestamp
          if (age < 30 * 60 * 1000) {
            setData(parsed.data)
            setLoading(false)
            return
          }
        } catch (e) {}
      }
    }

    let lat = 23.2257
    let lng = 77.3867
    let city = user.city || 'Mumbai'

    const cachedLoc = localStorage.getItem('yuno_cached_user_location')
    const cachedCity = localStorage.getItem('yuno_cached_city')

    if (cachedLoc) {
      try {
        const parsed = JSON.parse(cachedLoc)
        lat = parsed[0]
        lng = parsed[1]
      } catch (e) {}
    }
    if (cachedCity) {
      city = cachedCity
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchQuest(pos.coords.latitude, pos.coords.longitude, city)
        },
        () => {
          fetchQuest(lat, lng, city)
        },
        { timeout: 5000 }
      )
    } else {
      fetchQuest(lat, lng, city)
    }
  }

  useEffect(() => {
    triggerFetch(false)
  }, [user])

  const handlePlotOnMap = () => {
    if (!data) return
    // Route to the map, passing coordinates to center the map on the landmark quest
    router.push(`/map?lat=${data.latitude}&lng=${data.longitude}&questName=${encodeURIComponent(data.name)}`)
  }

  if (loading) {
    return (
      <div className="yuno-card p-6 min-h-[160px] animate-pulse flex flex-col justify-between">
        <div className="h-4 bg-white/20 rounded w-1/3 mb-4" />
        <div className="h-3 bg-white/20 rounded w-full mb-2" />
        <div className="h-3 bg-white/20 rounded w-2/3" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="yuno-card p-5 flex flex-col justify-between relative overflow-hidden min-h-[140px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#b5511b]" />
          <span className="text-xs font-semibold text-[#54433a]">
            Landmark Quest
          </span>
        </div>
        <button 
          onClick={() => triggerFetch(true)} 
          className="text-[#54433a] hover:text-[#b5511b] transition-colors p-1 rounded hover:bg-white/10"
          title="New Quest"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 mb-4">
        <h3 className="font-bold text-[#231b15] text-sm leading-snug flex items-center gap-1.5 mb-1.5 font-sans">
          <MapPin className="w-3.5 h-3.5 text-[#b5511b] shrink-0" />
          {data.name}
        </h3>
        <p className="text-xs text-[#54433a]/80 leading-relaxed">
          {data.questText}
        </p>
      </div>

      {/* Action */}
      <button
        onClick={handlePlotOnMap}
        className="w-full text-center py-2 bg-[#5d4037]/10 hover:bg-[#5d4037]/15 text-[#5d4037] border border-[#5d4037]/15 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 font-bold"
      >
        Plot Quest on Map
      </button>
    </div>
  )
}
