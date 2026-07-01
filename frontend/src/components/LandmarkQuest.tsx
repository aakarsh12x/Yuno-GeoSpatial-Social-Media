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
      }
    } catch (e) {
      console.error('Error fetching landmark quest:', e)
    } finally {
      setLoading(false)
    }
  }

  const triggerFetch = () => {
    if (!user) return

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
    triggerFetch()
  }, [user])

  const handlePlotOnMap = () => {
    if (!data) return
    // Route to the map, passing coordinates to center the map on the landmark quest
    router.push(`/map?lat=${data.latitude}&lng=${data.longitude}&questName=${encodeURIComponent(data.name)}`)
  }

  if (loading) {
    return (
      <div className="bg-[#FDFAF6] border border-[#EDE7E0] rounded-2xl p-6 min-h-[160px] animate-pulse flex flex-col justify-between shadow-soft">
        <div className="h-4 bg-[#EDE7E0] rounded w-1/3 mb-4" />
        <div className="h-3 bg-[#EDE7E0] rounded w-full mb-2" />
        <div className="h-3 bg-[#EDE7E0] rounded w-2/3" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-[#FDFAF6] border border-[#EDE7E0] rounded-2xl p-6 shadow-soft hover:shadow-elegant hover:border-[#D4C3B3] transition-all duration-300 flex flex-col justify-between relative overflow-hidden min-h-[160px]">
      {/* Design accents */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-[#D4453A]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#D4453A] animate-pulse" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4453A] font-bold">
            Time Capsule Quest
          </span>
        </div>
        <button 
          onClick={triggerFetch} 
          className="text-text-muted hover:text-primary transition-colors p-1 rounded hover:bg-[#EDE7E0]/40"
          title="New Quest"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 mb-4">
        <h3 className="font-serif text-[#1E1616] font-bold text-sm leading-snug flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#D4453A] shrink-0" />
          {data.name}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed font-sans">
          {data.questText}
        </p>
      </div>

      {/* Action */}
      <button
        onClick={handlePlotOnMap}
        className="w-full text-center py-2 bg-[#EDE7E0] hover:bg-[#E4DCD0] text-[#1E1616] border border-[#D4C3B3]/40 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200"
      >
        Plot Quest on Map
      </button>
    </div>
  )
}
