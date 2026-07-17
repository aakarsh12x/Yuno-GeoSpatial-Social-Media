'use client'

import { useState, useEffect } from 'react'
import { VibeAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Compass } from 'lucide-react'

interface WeatherData {
  temperature: number
  windspeed: number
  condition: string
  isDay: boolean
  vibeText: string
}

export default function WeatherVibe() {
  const { user } = useAuth()
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWeatherVibe = async (lat: number, lng: number, city: string) => {
    try {
      const res = await VibeAPI.getWeather(lat, lng, city)
      if (res.data?.success) {
        setData(res.data.data)
        try {
          localStorage.setItem('yuno_weather_cache', JSON.stringify({
            data: res.data.data,
            timestamp: Date.now()
          }))
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error fetching weather vibe:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    // 1. Try to read from cache synchronously first to prevent refetches
    const cachedWeather = localStorage.getItem('yuno_weather_cache')
    if (cachedWeather) {
      try {
        const parsed = JSON.parse(cachedWeather)
        const age = Date.now() - parsed.timestamp
        if (age < 30 * 60 * 1000) {
          setData(parsed.data)
          setLoading(false)
          return
        }
      } catch (e) {}
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

    // Call geolocation to check for live updates
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherVibe(pos.coords.latitude, pos.coords.longitude, city)
        },
        () => {
          fetchWeatherVibe(lat, lng, city)
        },
        { timeout: 5000 }
      )
    } else {
      fetchWeatherVibe(lat, lng, city)
    }
  }, [user])

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase()
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-8 h-8 text-blue-600" />
    if (c.includes('thunder')) return <CloudLightning className="w-8 h-8 text-amber-600" />
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-8 h-8 text-[#8B7E74]" />
    return <Sun className="w-8 h-8 text-orange-500 animate-spin" style={{ animationDuration: '30s' }} />
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
    <div className="yuno-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden min-h-[140px] font-sans">
      {/* Left side: Weather statistics */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="p-3 bg-white/30 rounded-lg border border-white/30 flex items-center justify-center">
          {getWeatherIcon(data.condition)}
        </div>
        <div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-bold text-[#231b15] tracking-tight">{data.temperature}</span>
            <span className="text-xs font-mono text-[#b5511b] font-semibold">°C</span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#54433a]/80 mt-0.5 font-bold">
            {data.condition}
          </p>
        </div>
      </div>

      {/* Right side: AI curated Vibe */}
      <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#5d4037]/10 pt-4 md:pt-0 md:pl-6">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Compass className="w-3.5 h-3.5 text-[#b5511b]" />
          <span className="text-xs font-semibold text-[#54433a]">
            Microclimate Vibe
          </span>
        </div>
        <p className="text-xs text-[#231b15] leading-relaxed font-normal">
          &ldquo;{data.vibeText}&rdquo;
        </p>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-[#54433a]/80 font-mono">
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-[#54433a]/80" />
            {data.windspeed} km/h wind
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${data.isDay ? 'bg-amber-500' : 'bg-indigo-950'}`} />
            {data.isDay ? 'Daylight' : 'Nightfall'}
          </span>
        </div>
      </div>
    </div>
  )
}
