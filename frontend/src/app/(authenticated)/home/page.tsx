'use client'

import Link from 'next/link'
import { Map, ArrowRight, MapPin, Compass } from 'lucide-react'
import LocalActivities from '@/components/LocalActivities'
import WeatherVibe from '@/components/WeatherVibe'
import LandmarkQuest from '@/components/LandmarkQuest'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 pb-12 bg-transparent relative overflow-hidden font-sans">
      
      {/* Subtle Divider / Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-32 bg-transparent pointer-events-none" />

      {/* Personalized Greeting Section */}
      <div className="w-full max-w-5xl px-6 mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[#b5511b]" />
              <span className="text-xs font-semibold text-[#54433a]">Activity Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl text-[#231b15] tracking-tight leading-none font-display italic font-medium">
              Welcome back, <span className="text-[#b5511b] font-display italic font-medium">{user?.name?.split(' ')[0] || 'Explorer'}</span>
            </h1>
            <p className="text-[#54433a] mt-2.5 text-sm md:text-base font-light leading-relaxed max-w-xl">
              Your coordinate tracker is active. Here are the live social vibes and happenings mapped around you today.
            </p>
          </div>
          
          {user?.city && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-[#e0d7d0] rounded-full shadow-sm self-start md:self-auto transition-transform hover:scale-105 duration-200 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[#b5511b]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#231b15] font-bold">{user.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Weather Vibe Banner */}
      <div className="w-full max-w-5xl px-6 mb-8 relative z-10">
        <WeatherVibe />
      </div>

      {/* Live Feed / Local Activities */}
      <div className="w-full max-w-5xl px-6 mb-8 relative z-10">
        <LocalActivities />
      </div>

      {/* Landmark Quest */}
      <div className="w-full max-w-5xl px-6 mb-10 relative z-10">
        <LandmarkQuest />
      </div>

      {/* Navigation & Next Steps Section */}
      <div className="w-full max-w-5xl px-6 mb-12 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xs font-semibold text-[#54433a]">Explore Yuno</h2>
          <div className="h-px flex-1 bg-[#5d4037]/10" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Discovery Map Card */}
          <Link href="/map" className="group lg:col-span-2">
            <div className="yuno-card p-6 h-full flex flex-col justify-between min-h-[200px] relative overflow-hidden">
              <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-105 transition-all duration-300">
                <Map className="w-32 h-32 text-[#b5511b]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#54433a]/65">
                  Interactive Map
                </span>
                <h3 className="text-xl font-bold mt-1.5 mb-2 text-[#231b15] font-sans">
                  Interactive Coordinates Map
                </h3>
                <p className="text-[#54433a] text-xs leading-relaxed max-w-md">
                  Plot live neighborhood pulses, navigate historic landmarks, and discover people nearby within custom geofenced circles.
                </p>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#b5511b] font-bold transition-colors">
                <span>Open Discovery Map</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Profile Card */}
          <Link href="/profile" className="group">
            <div className="yuno-card p-6 h-full flex flex-col justify-between min-h-[200px] relative overflow-hidden">
              <div>
                <span className="text-xs font-semibold text-[#54433a]/65">
                  Navigator Profile
                </span>
                <h3 className="text-xl font-bold mt-1.5 mb-2 text-[#231b15] font-sans">
                  Refine Preferences
                </h3>
                <p className="text-[#54433a] text-xs leading-relaxed">
                  Update your interests, write your bio, and help our matching algorithms locate compatible people.
                </p>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#54433a] group-hover:text-[#b5511b] transition-colors font-bold">
                <span>Update dossier</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center pb-8 relative z-10">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 bg-[#b5511b] hover:bg-[#943b0d] text-white px-6 py-2.5 rounded-lg active:scale-[0.98] transition-all duration-200 font-mono text-xs uppercase tracking-widest font-bold shadow-sm"
        >
          <span>Explore Local Map</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
