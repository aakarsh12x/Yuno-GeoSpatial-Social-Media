'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Image from 'next/image'
import Squares from '@/components/ui/Squares'
import SplitText from '@/components/ui/SplitText'
import ShinyText from '@/components/ui/ShinyText'
import Magnet from '@/components/ui/Magnet'
import Aurora from '@/components/ui/Aurora'
import { AstrolabeIcon, CelestialStar, VintageSparkle } from '@/components/VintageIcons'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110A07] flex items-center justify-center relative overflow-hidden">
        <Aurora blend={0.65} speed={1.2} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <AstrolabeIcon className="w-16 h-16 text-[#D4453A] animate-spin [animation-duration:10s]" />
          <p className="text-[#A08878] text-xs font-mono tracking-widest uppercase animate-pulse">Initializing Astrolabe...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (isSignup) {
      if (!name.trim()) return setError('Name is required'), setIsLoading(false)
      if (!email.trim()) return setError('Email is required'), setIsLoading(false)
      if (!password.trim()) return setError('Password is required'), setIsLoading(false)
      if (password.length < 6) return setError('Password must be at least 6 characters long'), setIsLoading(false)
    } else {
      if (!email.trim()) return setError('Email is required'), setIsLoading(false)
      if (!password.trim()) return setError('Password is required'), setIsLoading(false)
    }

    try {
      if (isSignup) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password: password.trim() }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.message || 'Registration failed')
          return
        }

        const data = await response.json()
        if (data.success) {
          const loginSuccess = await login(email, password)
          if (loginSuccess) router.push('/home')
        } else {
          setError(data.message || 'Registration failed.')
        }
      } else {
        const success = await login(email, password)
        if (success) router.push('/home')
        else setError('Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* Universal Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Aurora blend={0.6} speed={0.7} />
      </div>
      
      {/* Squares animated grid coordinates overlay */}
      <div className="absolute inset-0 opacity-[0.14] pointer-events-none z-0">
        <Squares speed={0.3} squareSize={44} borderColor="rgba(212, 69, 58, 0.15)" hoverFillColor="rgba(212, 69, 58, 0.05)" />
      </div>

      {/* ─── Left Panel — Editorial & Brand Astrolabe ────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] relative z-10 flex-col justify-between p-12 xl:p-16 border-r border-white/[0.04]">
        {/* Rotating Celestial Astrolabe background element */}
        <div className="absolute -top-24 -left-24 w-[600px] h-[600px] opacity-[0.03] text-white pointer-events-none select-none">
          <AstrolabeIcon className="w-full h-full animate-[spin_180s_linear_infinite]" />
        </div>

        {/* Top — Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image src="/logo.png" alt="Yuno Logo" fill className="object-contain filter brightness-125" sizes="48px" priority />
          </div>
          <div>
            <span className="font-serif text-white text-lg font-bold tracking-wider">yuno</span>
            <span className="block font-mono text-[9px] text-[#A08878]/60 uppercase tracking-widest">GeoSpatial Social Graph</span>
          </div>
        </div>

        {/* Middle — Headline */}
        <div className="flex-1 flex flex-col justify-center max-w-lg relative">
          <div className="absolute -right-12 top-0 text-white/5 pointer-events-none">
            <CelestialStar size={120} />
          </div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
              <VintageSparkle className="w-3.5 h-3.5 text-[#D4453A] animate-pulse" />
              <ShinyText text="System V2.5 Active" className="text-[10px] font-mono uppercase tracking-widest text-[#A08878] font-bold" />
            </div>
            
            <h1 className="text-white text-4xl xl:text-5xl font-serif font-bold leading-[1.15] tracking-tight">
              Find your people.
              <br />
              <span className="bg-gradient-to-r from-[#D4453A] to-[#EEB68A] bg-clip-text text-transparent">
                Right where you are.
              </span>
            </h1>
            
            <p className="text-[#A08878]/80 text-base font-light leading-relaxed max-w-md">
              Connect with nearby explorers, engage with live AI weather vibes, embark on historical landmark quests, and start conversations that matter.
            </p>
          </div>
        </div>

        {/* Bottom — Metadata & Location Info */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <p className="text-[#A08878]/55 text-xs leading-relaxed max-w-xs font-light">
            An agentic location-based social graph integrating real-time weather metrics, OSM landmark quests, and LLM matching.
          </p>
          <div className="shrink-0 text-left md:text-right font-mono text-[10px] tracking-widest">
            <span className="text-[#D4453A]/80 font-bold">LOC // 18.9724° N, 72.8258° E</span>
            <br />
            <span className="text-[#A08878]/40">REF // CARTOGRAPHERS_HEARTH</span>
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Floating Glassmorphic Login Console ────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16 relative z-10 overflow-y-auto">
        <div className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <Image src="/logo.png" alt="Yuno Logo" fill className="object-contain filter brightness-125" sizes="80px" priority />
            </div>
            <h1 className="font-serif text-white text-2xl font-bold tracking-wider">yuno</h1>
            <p className="text-[#A08878] text-xs font-mono uppercase tracking-widest mt-1">GeoSpatial Social Graph</p>
          </div>

          {/* Impeccable Glassmorphic Card */}
          <div className="bg-[#18110D]/75 backdrop-blur-2xl rounded-3xl border border-white/[0.06] shadow-[0_30px_100px_rgba(0,0,0,0.7),inset 0 1px 1px rgba(255,255,255,0.05)] p-8 lg:p-10 relative overflow-hidden group">
            
            {/* Card corner accent sparkles */}
            <div className="absolute top-4 right-4 text-[#D4453A]/20 pointer-events-none group-hover:text-[#D4453A]/50 transition-colors duration-500">
              <CelestialStar size={16} />
            </div>
            
            {/* Design header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-[2px] bg-[#D4453A]"></div>
                <div className="w-2 h-[2px] bg-[#D4453A]/30"></div>
                <span className="font-mono text-[9px] tracking-widest text-[#D4453A] uppercase font-bold">Logbook Entry</span>
              </div>
              
              <h2 className="text-white text-3xl font-serif font-bold tracking-tight">
                {isSignup ? 'Initialize Account' : 'Acknowledge Key'}
              </h2>
              <p className="text-[#A08878]/70 text-xs mt-2 font-light leading-relaxed">
                {isSignup
                  ? 'Join the local social graph to start mapping your path.'
                  : 'Enter your coordinates to sync with the geospatial network.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Signup only) */}
              {isSignup && (
                <div className="space-y-1.5 animate-[field-appear_0.3s_ease-out]">
                  <label htmlFor="name" className="block text-[10px] font-mono uppercase tracking-widest text-[#A08878] font-semibold pl-1">
                    Explorer Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08878]/40 group-focus-within:text-[#D4453A]/80 transition-colors duration-300" />
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0F0A07]/60 border border-white/[0.05] rounded-xl text-white text-sm placeholder:text-[#A08878]/40 focus:outline-none focus:border-[#D4453A]/60 focus:bg-[#0F0A07]/90 focus:shadow-[0_0_15px_rgba(212,69,58,0.1)] transition-all duration-300 font-mono"
                      placeholder="e.g. Vasco Da Gama"
                      required={isSignup}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[10px] font-mono uppercase tracking-widest text-[#A08878] font-semibold pl-1">
                  Email Coordinates
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08878]/40 group-focus-within:text-[#D4453A]/80 transition-colors duration-300" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0F0A07]/60 border border-white/[0.05] rounded-xl text-white text-sm placeholder:text-[#A08878]/40 focus:outline-none focus:border-[#D4453A]/60 focus:bg-[#0F0A07]/90 focus:shadow-[0_0_15px_rgba(212,69,58,0.1)] transition-all duration-300 font-mono"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[10px] font-mono uppercase tracking-widest text-[#A08878] font-semibold pl-1">
                  Verification Key
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08878]/40 group-focus-within:text-[#D4453A]/80 transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#0F0A07]/60 border border-white/[0.05] rounded-xl text-white text-sm placeholder:text-[#A08878]/40 focus:outline-none focus:border-[#D4453A]/60 focus:bg-[#0F0A07]/90 focus:shadow-[0_0_15px_rgba(212,69,58,0.1)] transition-all duration-300 font-mono"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A08878]/40 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Fixed height slot for error */}
              <div className="min-h-[24px] flex items-center">
                {error && (
                  <div className="w-full flex items-start gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/40 animate-[field-appear_0.25s_ease-out]">
                    <div className="w-1 h-1 rounded-full bg-[#D4453A] shrink-0 mt-[6px] animate-ping"></div>
                    <p className="text-[#FF8A80] text-[11px] leading-[1.3] font-mono">{error}</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="w-full pt-1">
                <Magnet className="w-full" strength={8}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group/btn text-white py-3.5 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #D4453A 0%, #B52820 100%)',
                      boxShadow: '0 4px 20px -2px rgba(212,69,58,0.4)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Initializing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <span>{isSignup ? 'Register Key' : 'Acknowledge Key'}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </button>
                </Magnet>
              </div>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/[0.06]"></div>
              <span className="text-[#A08878]/30 font-mono text-[9px] uppercase tracking-widest">Verification</span>
              <div className="flex-1 h-px bg-white/[0.06]"></div>
            </div>

            {/* Toggle signup/login */}
            <div className="text-center">
              <p className="text-[#A08878]/60 text-xs mb-2 font-light">
                {isSignup ? 'Already registered your key?' : 'New explorer coordinate?'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setName('')
                }}
                className="text-[#D4453A] font-mono font-bold text-xs uppercase tracking-widest hover:text-[#EEB68A] transition-colors duration-200 inline-flex items-center gap-1.5 group/toggle"
              >
                {isSignup ? 'Access Logbook' : 'Establish Key'}
                <ArrowRight className="w-3.5 h-3.5 group-hover/toggle:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>

          <p className="text-center text-[#A08878]/30 font-mono text-[9px] uppercase tracking-widest mt-8">
            © 2026 Yuno · Map the paths, find the sparks
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes field-appear {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
