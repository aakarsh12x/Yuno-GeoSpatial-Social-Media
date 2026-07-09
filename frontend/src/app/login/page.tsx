'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, Lock, Eye, EyeOff, Compass } from 'lucide-react'
import { VintageSparkle, AstrolabeIcon, CelestialStar } from '@/components/VintageIcons'
import Image from 'next/image'
import Squares from '@/components/ui/Squares'
import ShinyText from '@/components/ui/ShinyText'
import Magnet from '@/components/ui/Magnet'
import Aurora from '@/components/ui/Aurora'

export default function LoginPage() {
  const [email, setEmail] = useState('user123@example.com')
  const [password, setPassword] = useState('user')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/home')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('An error occurred during login.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] relative overflow-hidden flex items-center justify-center">
      
      {/* Aurora Background */}
      <Aurora blend={0.6} speed={0.7} />

      {/* Squares animated grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.14]">
        <Squares speed={0.35} squareSize={36} borderColor="rgba(212, 69, 58, 0.15)" hoverFillColor="rgba(212, 69, 58, 0.05)" />
      </div>

      {/* Antique circular frame overlays */}
      <div className="absolute -left-20 top-1/4 w-48 h-48 border border-white/[0.04] rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-36 h-36 border border-dashed border-white/[0.02] rounded-full" />
      </div>
      <div className="absolute -right-24 bottom-1/4 w-64 h-64 border border-white/[0.04] rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 border border-dashed border-white/[0.02] rounded-full" />
      </div>

      {/* Floating Interactive Badge Panels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block z-0">
        {/* Active Quest Vibe card */}
        <div
          className="absolute top-[20%] right-[10%] bg-[#18110D]/80 border border-white/[0.06] rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
          style={{ animation: 'float-card 6s ease-in-out infinite', width: '190px' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <Compass className="w-3.5 h-3.5 text-[#D4453A]" />
            </div>
            <ShinyText text="Active Quest" className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#A08878]" />
          </div>
          <p className="text-[#A08878]/70 text-[9.5px] leading-relaxed font-mono">Golghar Granary Quest is 1.8km nearby!</p>
        </div>

        {/* User Spark Vibe Card */}
        <div
          className="absolute bottom-[20%] left-[8%] bg-[#18110D]/80 border border-white/[0.06] rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
          style={{ animation: 'float-card 8s ease-in-out infinite 2s', width: '180px' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <VintageSparkle size={14} className="text-[#EEB68A]" />
            </div>
            <ShinyText text="Spark Alert" className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#A08878]" />
          </div>
          <p className="text-[#A08878]/70 text-[9.5px] leading-relaxed font-mono">You both love Himalayan Trekking.</p>
        </div>
      </div>

      {/* Main card panel */}
      <div
        className={`w-full max-w-[440px] px-6 py-12 relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Logo and Seal header */}
        <div className="text-center mb-6">
          <div className="relative w-24 h-24 mx-auto mb-2 select-none hover:rotate-3 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Yuno Logo"
              fill
              className="object-contain filter brightness-125"
              sizes="96px"
              priority
            />
          </div>
          <p className="text-[#A08878]/60 text-xs font-mono uppercase tracking-widest italic">
            &ldquo;Shared paths draw us closer&rdquo;
          </p>
        </div>

        {/* Paper Form Card */}
        <div className="bg-[#18110D]/80 border border-white/[0.06] rounded-3xl p-8 shadow-[0_30px_100px_rgba(0,0,0,0.7),inset 0 1px 1px rgba(255,255,255,0.05)] backdrop-blur-2xl relative overflow-hidden">
          {/* Top border compass coordinate line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4453A]/40 to-transparent" />

          {/* Card corner accent sparkles */}
          <div className="absolute top-4 right-4 text-[#D4453A]/25 pointer-events-none">
            <CelestialStar size={16} />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#D4453A] animate-pulse" />
              <ShinyText text="Agentic Logbook Verification" className="text-[9px] font-mono uppercase tracking-widest font-bold text-[#A08878]" />
            </div>
            <h2 className="text-white text-3xl font-serif font-bold tracking-tight">
              Sign In
            </h2>
            <p className="text-[#A08878]/70 text-xs mt-1.5 leading-relaxed font-light">
              Verify your coordinates to initialize the AI weather vibe agent, landmark quest engine, and matching graph.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email input field */}
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

            {/* Password input field */}
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
                  placeholder="Enter your key"
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

            {/* Error messaging */}
            <div className="min-h-[24px] flex items-center">
              {error && (
                <div className="w-full flex items-start gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/40 animate-[field-appear_0.25s_ease-out]">
                  <div className="w-1 h-1 rounded-full bg-[#D4453A] shrink-0 mt-[6px] animate-ping"></div>
                  <p className="text-[#FF8A80] text-[11px] leading-[1.3] font-mono">{error}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
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
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <span>Acknowledge Logbook</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </button>
              </Magnet>
            </div>
          </form>

          {/* Demo Credentials Panel */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2">
            <span className="text-[10px] font-mono text-[#A08878]/60">DEMO:</span>
            <code className="text-[9.5px] font-mono text-[#EEB68A] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">user123@example.com / user</code>
          </div>
        </div>

        {/* Copyright notice */}
        <p className="text-center text-[#A08878]/30 font-mono text-[9px] uppercase tracking-widest mt-8">
          © 2026 Yuno · Map the paths, find the sparks
        </p>
      </div>

      <style jsx>{`
        @keyframes float-card {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1.5deg); }
        }
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
