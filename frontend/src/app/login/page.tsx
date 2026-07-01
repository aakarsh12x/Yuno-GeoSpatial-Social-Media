'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, Lock, Eye, EyeOff, MapPin, Compass } from 'lucide-react'
import { VintageSparkle } from '@/components/VintageIcons'
import Image from 'next/image'

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
    <div className="min-h-screen bg-[#FDFAF6] bg-[radial-gradient(#EDE7E0_1px,transparent_1px)] [background-size:24px_24px] relative overflow-hidden flex items-center justify-center">
      
      {/* Antique circular frame overlays */}
      <div className="absolute -left-20 top-1/4 w-48 h-48 border border-[#EDE7E0]/40 rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-36 h-36 border border-dashed border-[#EDE7E0]/30 rounded-full" />
      </div>
      <div className="absolute -right-24 bottom-1/4 w-64 h-64 border border-[#EDE7E0]/35 rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 border border-dashed border-[#EDE7E0]/25 rounded-full" />
      </div>

      {/* Floating Interactive Badge Panels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        {/* Active Quest Vibe card */}
        <div
          className="absolute top-[20%] right-[10%] bg-[#FDFAF6] border border-[#EDE7E0] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(30,22,22,0.06)]"
          style={{ animation: 'float-card 6s ease-in-out infinite', width: '190px' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#EDE7E0] flex items-center justify-center border border-[#D4C3B3]/40">
              <Compass className="w-3.5 h-3.5 text-[#D4453A]" />
            </div>
            <span className="text-[#1E1616] text-[10px] font-mono uppercase tracking-wider font-bold">Active Quest</span>
          </div>
          <p className="text-[#8B7E74] text-[9.5px] leading-relaxed">Golghar Granary Quest is 1.8km nearby!</p>
        </div>

        {/* User Spark Vibe Card */}
        <div
          className="absolute bottom-[20%] left-[8%] bg-[#FDFAF6] border border-[#EDE7E0] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(30,22,22,0.06)]"
          style={{ animation: 'float-card 8s ease-in-out infinite 2s', width: '180px' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#EDE7E0] flex items-center justify-center border border-[#D4C3B3]/40">
              <VintageSparkle size={14} className="text-[#D4AF37]" />
            </div>
            <span className="text-[#1E1616] text-[10px] font-mono uppercase tracking-wider font-bold">Spark Alert</span>
          </div>
          <p className="text-[#8B7E74] text-[9.5px] leading-relaxed">You both love Himalayan Trekking.</p>
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
          <div className="relative w-28 h-28 mx-auto mb-2 select-none hover:rotate-3 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Yuno Logo"
              fill
              className="object-contain"
              sizes="112px"
              priority
            />
          </div>
          <p className="text-[#8B7E74] text-xs font-mono uppercase tracking-widest italic">
            &ldquo;Shared paths draw us closer&rdquo;
          </p>
        </div>

        {/* Paper Form Card */}
        <div className="bg-[#FDFAF6] border border-[#EDE7E0] rounded-3xl p-8 shadow-[0_12px_40px_-8px_rgba(30,22,22,0.08),0_2px_8px_rgba(30,22,22,0.03)] relative overflow-hidden">
          {/* Top border compass coordinate line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#D4453A]/40 to-transparent" />

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4453A] animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4453A] font-bold">
                Agentic Logbook Verification
              </span>
            </div>
            <h2 className="text-[#1E1616] text-3xl font-serif font-bold tracking-tight">
              Sign In
            </h2>
            <p className="text-[#8B7E74] text-xs mt-1.5 leading-relaxed">
              Verify your coordinates to initialize the AI weather vibe agent, landmark quest engine, and matching graph.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-[9px] font-mono font-bold text-[#D4453A] uppercase tracking-widest mb-1.5 pl-0.5">
                Email Coordinates
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#8B7E74] group-focus-within:text-[#D4453A] transition-colors duration-300" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFAF6] border border-[#EDE7E0] rounded-xl text-[#1E1616] text-xs placeholder:text-[#8B7E74]/60 focus:outline-none focus:border-[#D4453A] focus:bg-[#FDFAF6] focus:shadow-[0_0_0_3px_rgba(212,69,58,0.06)] transition-all duration-300 font-mono"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-[9px] font-mono font-bold text-[#D4453A] uppercase tracking-widest mb-1.5 pl-0.5">
                Verification Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#8B7E74] group-focus-within:text-[#D4453A] transition-colors duration-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FDFAF6] border border-[#EDE7E0] rounded-xl text-[#1E1616] text-xs placeholder:text-[#8B7E74]/60 focus:outline-none focus:border-[#D4453A] focus:bg-[#FDFAF6] focus:shadow-[0_0_0_3px_rgba(212,69,58,0.06)] transition-all duration-300 font-mono"
                  placeholder="Enter your key"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B7E74] hover:text-[#D4453A] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error messaging */}
            {error && (
              <div
                className="flex items-start gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100"
                style={{ animation: 'field-appear 0.3s ease-out' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4453A] shrink-0 mt-1.5 animate-ping"></div>
                <p className="text-[#D4453A] text-xs leading-relaxed font-mono">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D4453A] hover:bg-[#1E1616] text-[#FDFAF6] border border-[#1E1616]/20 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] mt-2 font-mono text-xs uppercase tracking-widest font-bold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#FDFAF6]/30 border-t-[#FDFAF6] rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Acknowledge Logbook</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials Panel */}
          <div className="mt-5 pt-4 border-t border-[#EDE7E0] flex items-center justify-center gap-2">
            <span className="text-[10px] font-mono text-[#8B7E74]">DEMO CREDENTIALS:</span>
            <code className="text-[10px] font-mono text-[#D4453A] bg-[#EDE7E0]/45 px-1.5 py-0.5 rounded border border-[#EDE7E0]">user123@example.com / user</code>
          </div>
        </div>

        {/* Copyright notice */}
        <p className="text-center text-[#8B7E74]/60 text-[10px] mt-6 font-mono uppercase tracking-wider">
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
            transform: translateY(6px);
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
