'use client'

import Link from 'next/link'
import { Map, ArrowRight, MapPin, Compass } from 'lucide-react'
import LocalActivities from '@/components/LocalActivities'
import WeatherVibe from '@/components/WeatherVibe'
import LandmarkQuest from '@/components/LandmarkQuest'
import { CelestialStar } from '@/components/VintageIcons'
import { useAuth } from '@/context/AuthContext'
import Squares from '@/components/ui/Squares'
import TiltedCard from '@/components/ui/TiltedCard'
import Magnet from '@/components/ui/Magnet'
import ShinyText from '@/components/ui/ShinyText'
import SplitText from '@/components/ui/SplitText'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-0 pb-12 bg-[#FDFAF6] relative overflow-hidden">
      
      {/* Squares animated grid background for internal cartography mapping */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.25]">
        <Squares speed={0.2} squareSize={40} borderColor="rgba(93, 64, 55, 0.08)" hoverFillColor="rgba(212, 69, 58, 0.03)" />
      </div>

      {/* Decorative Cartography Accents */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#EDE7E0]/30 to-transparent pointer-events-none" />
      <div className="absolute -left-16 top-40 w-32 h-32 border border-[#EDE7E0]/30 rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-24 h-24 border border-dashed border-[#EDE7E0]/40 rounded-full" />
      </div>
      <div className="absolute -right-16 top-96 w-48 h-48 border border-[#EDE7E0]/20 rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-36 h-36 border border-dashed border-[#EDE7E0]/30 rounded-full" />
      </div>

      {/* Personalized Greeting Section */}
      <div className="w-full max-w-5xl px-6 mb-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EDE7E0] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[#D4453A] animate-spin" style={{ animationDuration: '60s' }} />
              <ShinyText text="Logbook Entry #07" className="text-[10px] font-mono uppercase tracking-widest font-bold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#1E1616] tracking-tight leading-none">
              <SplitText text="Welcome back, " delay={0.1} />
              <span className="text-[#D4453A] italic font-semibold">
                <SplitText text={user?.name?.split(' ')[0] || 'Explorer'} delay={0.4} />
              </span>
            </h1>
            <p className="text-[#8B7E74] mt-2.5 text-base md:text-lg font-light leading-relaxed max-w-xl">
              Your coordinate tracker is active. Here are the live social vibes and happenings mapped around you today.
            </p>
          </div>
          
          {user?.city && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#FDFAF6] border border-[#EDE7E0] rounded-full shadow-[0_2px_8px_rgba(30,22,22,0.04)] self-start md:self-auto transition-transform hover:scale-105 duration-200">
              <MapPin className="w-4 h-4 text-[#D4453A]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#1E1616] font-bold">{user.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero: AI Recommendations Section */}
      <div className="w-full max-w-5xl px-6 mb-8 relative z-10">
        <div className="flex items-center gap-2.5 mb-4 pl-1">
          <CelestialStar size={18} className="text-[#D4AF37]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E1616] font-bold">Curated Vibe Stream</span>
        </div>
        <LocalActivities />
      </div>

      {/* Atmospheric Microclimate & Quests Grid */}
      <div className="w-full max-w-5xl px-6 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <WeatherVibe />
        <LandmarkQuest />
      </div>

      {/* Navigation & Next Steps Section - Asymmetric Design */}
      <div className="w-full max-w-5xl px-6 mb-16 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#1E1616] font-bold">Continue Your Journey</h2>
          <div className="h-px flex-1 bg-[#EDE7E0]" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Featured Discovery Map Card (Spans 2 columns) */}
          <Link href="/map" className="group lg:col-span-2">
            <TiltedCard className="h-full" maxTilt={4} scale={1.015}>
              <div className="bg-[#FDFAF6] border border-[#EDE7E0] hover:border-[#D4453A] rounded-2xl p-8 hover:shadow-[0_8px_30px_rgb(30, 22, 22,0.06)] transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden min-h-[240px]">
                {/* Overlay graphics */}
                <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-105 transition-all duration-500">
                  <Map className="w-48 h-48 text-[#D4453A]" />
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#EDE7E0]/10 rounded-bl-full pointer-events-none" />

                <div className="relative z-10">
                  <span className="text-[9px] font-mono tracking-widest uppercase font-bold">
                    <ShinyText text="Primary Cartography" />
                  </span>
                  <h3 className="text-2xl font-serif font-bold mt-2 mb-2 text-[#1E1616]">
                    Interactive Coordinates Map
                  </h3>
                  <p className="text-[#8B7E74] text-xs leading-relaxed max-w-md">
                    Plot live neighborhood pulses, navigate historic landmarks, and discover people nearby within custom geofenced circles.
                  </p>
                </div>
                
                <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D4453A] font-bold group-hover:text-[#1E1616] transition-colors">
                  <span>Engage Navigator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </TiltedCard>
          </Link>

          {/* Secondary Profile Refinement Card (Spans 1 column) */}
          <Link href="/profile" className="group">
            <TiltedCard className="h-full" maxTilt={6} scale={1.02}>
              <div className="bg-[#FDFAF6]/60 border border-[#EDE7E0] hover:border-[#D4453A] hover:bg-[#FDFAF6] rounded-2xl p-8 hover:shadow-[0_8px_30px_rgb(30, 22, 22,0.06)] transition-all duration-300 h-full flex flex-col justify-between min-h-[240px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#EDE7E0]/20 rounded-bl-full pointer-events-none" />
                
                <div>
                  <span className="text-[9px] font-mono tracking-widest uppercase font-bold">
                    <ShinyText text="Navigator Dossier" />
                  </span>
                  <h3 className="text-xl font-serif font-bold mt-2 mb-2 text-[#1E1616]">
                    Refine Preferences
                  </h3>
                  <p className="text-[#8B7E74] text-xs leading-relaxed">
                    Update your interests, write your bio, and help our matching algorithms locate compatible people.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8B7E74] group-hover:text-[#D4453A] transition-colors font-bold">
                  <span>Update dossier</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </TiltedCard>
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center pb-12 relative z-10">
        <Magnet strength={12}>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 bg-[#D4453A] hover:bg-[#1E1616] text-[#FDFAF6] border border-[#1E1616]/20 px-8 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-300 font-mono text-xs uppercase tracking-widest font-bold"
          >
            Plot New Course
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Magnet>
        <p className="text-[#8B7E74] text-[10px] mt-4 font-mono uppercase tracking-widest italic">
          &ldquo;Paths crossed are stories shared.&rdquo;
        </p>
      </div>
    </div>
  )
}
