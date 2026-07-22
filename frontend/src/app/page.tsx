'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import {
  Compass,
  MapPin,
  MessageSquare,
  Zap,
  ArrowRight,
  Menu,
  X
} from 'lucide-react'
import GeospatialBackground from '@/components/GeospatialBackground'
import GlassSurface from '@/components/ui/GlassSurface'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!mounted) return

    // GSAP load-in animations with prefers-reduced-motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set('.gsap-hero-title, .gsap-hero-text, .gsap-hero-ctas, .gsap-hero-visual', { opacity: 1, y: 0, scale: 1 })
      return
    }

    const tl = gsap.timeline()
    tl.fromTo('.gsap-hero-title', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.gsap-hero-text', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.6'
    )
    .fromTo('.gsap-hero-ctas', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.6'
    )
    .fromTo('.gsap-hero-visual', 
      { opacity: 0, scale: 0.96, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power4.out' },
      '-=0.9'
    )
  }, [mounted])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Compass className="w-10 h-10 text-[#b5511b] animate-spin [animation-duration:6s]" />
          <p className="text-[#b5511b] text-xs font-mono tracking-widest uppercase animate-pulse">
            Resolving Coordinates...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden font-sans text-[#231b15] selection:bg-[#fcead2] selection:text-[#54433a] pb-12">
      {/* Fullscreen Background Image with Tint Filter */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#f8f6f0]">
        <Image
          src="/images/login_glass_bg.png"
          alt="Yuno Background Refraction"
          fill
          priority
          className="object-cover opacity-60 filter saturate-[0.9] brightness-[0.85]"
        />
        {/* Soft, beautiful warm terracotta and cream gradient overlay tint */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#f8f6f0]/95 via-[#f8f6f0]/60 to-[#b5511b]/20 mix-blend-multiply z-0" />
        {/* Subtle blur */}
        <div className="absolute inset-0 bg-[#f8f6f0]/30 backdrop-blur-[4px] z-0" />
        
        {/* Sub-grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] z-0"
          style={{
            backgroundImage: `
              radial-gradient(#8b7d75 1px, transparent 1px),
              linear-gradient(to right, rgba(139, 125, 117, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(139, 125, 117, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px, 160px 160px, 160px 160px',
            backgroundPosition: 'center center',
          }}
        />
      </div>

      {/* Floating Header Navigation using GlassSurface */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex justify-center">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={24}
          borderWidth={0.06}
          brightness={99}
          opacity={0.05}
          blur={15}
          backgroundOpacity={0.05}
          className="border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_32px_rgba(84,67,58,0.06)]"
        >
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Image
                  src="/logo.png"
                  alt="Yuno Logo"
                  width={85}
                  height={50}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>



            {/* CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="text-xs font-mono uppercase tracking-wider text-[#54433a] hover:text-[#b5511b] transition-all duration-200 font-bold active:scale-[0.98]"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/login?mode=signup')}
                className="px-4 py-2 bg-white/20 hover:bg-[#b5511b] hover:text-white border border-white/30 hover:border-[#b5511b] rounded-full text-xs font-mono uppercase tracking-widest font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                Join Yuno
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-[#54433a] focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </GlassSurface>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-[#faf9f6]/95 backdrop-blur-xl border border-[#ebdcd0] p-6 rounded-2xl space-y-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200 z-50">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); router.push('/login'); }}
                className="w-full py-2.5 text-center text-xs font-mono uppercase tracking-wider text-[#54433a] font-bold border border-[#ebdcd0] rounded-full"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); router.push('/login?mode=signup'); }}
                className="w-full py-2.5 text-center text-xs font-mono uppercase tracking-wider bg-[#b5511b] hover:bg-[#943b0d] text-white font-bold rounded-full"
              >
                Join Yuno
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 min-h-[calc(100dvh-96px)] flex items-center pt-28 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-6 space-y-8">


              {/* Serif Display Font Pairing (Fraunces) */}
              <h1 className="gsap-hero-title text-[#231b15] text-4xl sm:text-5xl lg:text-[62px] font-display italic font-medium tracking-tight leading-[1.08] text-balance">
                The city is alive. <br />
                Step onto the map.
              </h1>

              {/* Strict subtext length constraint */}
              <p className="gsap-hero-text text-[#54433a] text-base leading-relaxed max-w-[55ch] font-sans">
                An agentic geospatial social media platform replacing rigid algorithms with autonomous spatial intelligence, live location coordinates, and spontaneous real-world gatherings.
              </p>

              <div className="gsap-hero-ctas flex items-center gap-4">
                <button
                  onClick={() => router.push('/login?mode=signup')}
                  className="px-6 py-3.5 bg-[#b5511b] hover:bg-[#943b0d] text-white rounded-full text-xs font-mono uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(181,81,27,0.12)] hover:shadow-[0_4px_20px_rgba(148,59,13,0.22)] active:scale-[0.98]"
                >
                  Join Yuno
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-3.5 border border-[#ebdcd0] hover:border-[#b5511b] rounded-full text-xs font-mono uppercase tracking-widest font-bold text-[#54433a] hover:text-[#b5511b] transition-all duration-300 flex items-center justify-center gap-2 bg-white/40 backdrop-blur-sm active:scale-[0.98]"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right Column: Premium Custom 3D Glass Topographic Map */}
            <div className="gsap-hero-visual lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px] aspect-square yuno-card p-4 overflow-hidden group">
                <div className="absolute inset-2 border border-white/20 rounded-[20px] pointer-events-none" />
                
                {/* Main 3D glass topographic visualization */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white/40 border border-[#ebdcd0]/40 flex items-center justify-center shadow-inner">
                  <img 
                    src="/images/hero_glass_map.png" 
                    alt="Tactile 3D Glass Topographic Map representation" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            
            {/* Header: Centered, Friendly */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-[#1a0f0a] text-4xl sm:text-5xl font-display italic font-medium tracking-tight leading-[1.1]">
                How Yuno Works
              </h2>
              <p className="text-[#3e2723] text-xs sm:text-sm leading-relaxed">
                Connect naturally with people, places, and events happening around you right now.
              </p>
            </div>

            {/* 3-Column Grid of Features */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              
              {/* Feature 1: Real-Time Signals */}
              <div className="yuno-card p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#1a0f0a] font-sans">
                      Real-Time Local Signals
                    </h3>
                    <p className="text-[#54433a] text-xs leading-relaxed font-sans">
                      Posts and activities fade after 30 minutes. No endless history or addictive algorithms—just real, active events in your neighborhood.
                    </p>
                  </div>
                </div>

                {/* List of active events */}
                <div className="space-y-2 mt-4 text-[#54433a]/90 font-serif italic text-xs border-l-2 border-[#b5511b]/30 pl-4 py-1">
                  <div>• Ambient Music Session (12m ago)</div>
                  <div>• Sunset Yoga Group (28m ago)</div>
                  <div>• Local Book Exchange (44m ago)</div>
                </div>
              </div>

              {/* Feature 2: Instant Grouping */}
              <div className="yuno-card p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#1a0f0a] font-sans">
                      Instant Vibe Matching
                    </h3>
                    <p className="text-[#54433a] text-xs leading-relaxed font-sans">
                      Find people who share your vibe. Hop into group chats right on the map to coordinate and meet up effortlessly.
                    </p>
                  </div>
                </div>

                {/* Conversational chat bubble mockup */}
                <div className="space-y-3 mt-4">
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-3 text-xs text-[#54433a] inline-block max-w-[85%] font-sans">
                    "Setting up at the vinyl corner. Who's nearby?"
                  </div>
                  <div className="text-right">
                    <div className="bg-[#b5511b] text-white rounded-2xl p-3 text-xs inline-block max-w-[85%] text-left font-sans shadow-sm">
                      "Just walked into the shop. Be right there!"
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Fast & Private */}
              <div className="yuno-card p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#1a0f0a] font-sans">
                      Fast & Privacy-First
                    </h3>
                    <p className="text-[#54433a] text-xs leading-relaxed font-sans">
                      Map data loads directly on your phone, keeping your experience smooth and saving your battery while protecting your location.
                    </p>
                  </div>
                </div>

                {/* Quote card */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mt-4 text-[#54433a] space-y-2">
                  <p className="text-xs italic font-serif leading-relaxed">
                    "Your location data stays fast and private on your phone, giving you instant neighborhood updates without delay."
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Asymmetrical Editorial Invite CTA */}
        <section className="relative z-10 py-24 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="yuno-card p-8 sm:p-12 flex flex-col md:flex-row items-stretch justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#b5511b]/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
              
              {/* Left Column */}
              <div className="space-y-6 max-w-xl flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#b5511b] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b5511b]" />
                    YUNO NETWORK
                  </div>
                  <h2 className="text-[#1a0f0a] text-3xl sm:text-4xl font-display italic font-medium tracking-tight">
                    Your neighborhood is active. Join the network.
                  </h2>
                  <p className="text-[#54433a] text-xs sm:text-sm leading-relaxed max-w-[45ch]">
                    Create your profile coordinate node, map local activities, and explore the live signal feed instantly.
                  </p>
                </div>
              </div>

              {/* Right Column: CTA action container */}
              <div className="flex flex-col justify-end items-start md:items-end gap-6 md:min-w-[200px]">
                <button
                  onClick={() => router.push('/login?mode=signup')}
                  className="px-8 py-4 bg-[#b5511b] hover:bg-[#943b0d] text-white rounded-full text-xs font-mono uppercase tracking-widest font-bold transition-all duration-300 shadow-[0_4px_20px_rgba(181,81,27,0.12)] hover:shadow-[0_4px_24px_rgba(148,59,13,0.22)] active:scale-[0.98] w-full md:w-auto text-center"
                >
                  Join Yuno
                </button>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#ebdcd0]/20 bg-[#faf9f6]/40 backdrop-blur-md py-8 text-center text-[10px] text-[#54433a]/60 font-mono tracking-wider uppercase">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-[#54433a] flex items-center gap-1.5">
            YUNO
          </span>
          <span className="normal-case tracking-normal text-xs text-[#54433a]/40">© 2026 Yuno. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
