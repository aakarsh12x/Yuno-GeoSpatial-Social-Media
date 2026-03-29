'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Image from 'next/image'

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

  // Redirect authenticated users to home
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#F0E6DA]"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D4453A] animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Client-side validation
    if (isSignup) {
      if (!name.trim()) {
        setError('Name is required')
        setIsLoading(false)
        return
      }
      if (!email.trim()) {
        setError('Email is required')
        setIsLoading(false)
        return
      }
      if (!password.trim()) {
        setError('Password is required')
        setIsLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        setIsLoading(false)
        return
      }
    } else {
      if (!email.trim()) {
        setError('Email is required')
        setIsLoading(false)
        return
      }
      if (!password.trim()) {
        setError('Password is required')
        setIsLoading(false)
        return
      }
    }

    try {
      if (isSignup) {
        const requestBody = { name: name.trim(), email: email.trim(), password: password.trim() }
        console.log('Sending registration request:', requestBody)
        console.log('Form values:', { name, email, password })

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Registration failed:', { status: response.status, error: errorData })
          setError(errorData.message || `Registration failed with status ${response.status}`)
          return
        }

        const data = await response.json()
        console.log('Registration response:', { status: response.status, data })

        if (data.success) {
          const loginSuccess = await login(email, password)
          if (loginSuccess) {
            router.push('/home')
          } else {
            setError('Registration successful but login failed. Please try logging in.')
          }
        } else {
          setError(data.message || 'Registration failed. Please try again.')
        }
      } else {
        const success = await login(email, password)
        if (success) {
          router.push('/home')
        } else {
          setError('Login failed. Please check your credentials.')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-[#FEFCF9] flex flex-col lg:flex-row overflow-hidden">

      {/* ─── Left Panel — Premium brand showcase ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Deep warm background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #1A0F0A 0%, #2D1810 30%, #3D1F12 60%, #4A2515 100%)',
          }}
        />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Warm glow accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 30% 90%, rgba(212,69,58,0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 10%, rgba(238,182,138,0.08) 0%, transparent 40%)
            `,
          }}
        />

        {/* Geometric accent lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Horizontal thin line */}
          <div
            className="absolute h-px bg-gradient-to-r from-transparent via-[#D4453A]/20 to-transparent"
            style={{ top: '35%', left: '0', right: '0', animation: 'line-glow 4s ease-in-out infinite alternate' }}
          />
          {/* Vertical accent */}
          <div
            className="absolute w-px bg-gradient-to-b from-transparent via-[#EEB68A]/15 to-transparent"
            style={{ left: '75%', top: '0', bottom: '0' }}
          />
          {/* Corner accent */}
          <div
            className="absolute w-24 h-24 border-l border-t border-[#D4453A]/15 rounded-tl-3xl"
            style={{ top: '8%', left: '8%' }}
          />
          <div
            className="absolute w-16 h-16 border-r border-b border-[#EEB68A]/10 rounded-br-2xl"
            style={{ bottom: '12%', right: '12%' }}
          />
        </div>

        {/* Brand content */}
        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full h-full">
          {/* Top — Logo */}
          <div>
            <div className="relative w-36 h-36 -ml-4 mb-0" style={{ filter: 'brightness(1.8)' }}>
              <Image
                src="/logo.png"
                alt="Yuno Logo"
                fill
                className="object-contain"
                sizes="144px"
                priority
              />
            </div>
          </div>

          {/* Middle — Headline */}
          <div className="flex-1 flex flex-col justify-center -mt-8">
            <div className="space-y-6">
              <h1 className="text-white text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
                Find your people.
                <br />
                <span className="text-[#D4453A]">Right where you are.</span>
              </h1>
              <p className="text-[#A08878] text-lg font-light leading-relaxed max-w-md">
                Connect with nearby people who share your passions, start conversations that matter, and build your local community.
              </p>
            </div>

          </div>

          {/* Bottom — Stats */}
          <div className="pt-8 border-t border-white/[0.06]">
            <div className="flex items-end gap-10">
              <div>
                <p className="text-white text-2xl font-bold tracking-tight">2,400+</p>
                <p className="text-[#6B584E] text-xs mt-0.5 uppercase tracking-widest">People nearby</p>
              </div>
              <div>
                <p className="text-white text-2xl font-bold tracking-tight">18k</p>
                <p className="text-[#6B584E] text-xs mt-0.5 uppercase tracking-widest">Sparks sent</p>
              </div>
              <div>
                <p className="text-white text-2xl font-bold tracking-tight">40+</p>
                <p className="text-[#6B584E] text-xs mt-0.5 uppercase tracking-widest">Cities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Auth form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-8 relative overflow-y-auto">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #2D1810 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div
          className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="relative w-28 h-28 mx-auto mb-1">
              <Image
                src="/logo.png"
                alt="Yuno Logo"
                fill
                className="object-contain"
                sizes="100px"
                priority
              />
            </div>
            <p className="text-[#7A5C4F] text-sm font-light">Connect with people nearby</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-[#F0E6DA]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_-8px_rgba(45,24,16,0.08)] p-7 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-[3px] rounded-full bg-[#D4453A]"></div>
                <div className="w-2 h-[3px] rounded-full bg-[#D4453A]/30"></div>
              </div>
              <h2 className="text-[#1A0F0A] text-2xl font-bold tracking-tight leading-tight">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-[#8B6F5E] text-sm mt-1.5 font-light">
                {isSignup
                  ? 'Start discovering people near you'
                  : 'Sign in to continue exploring'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name field (signup only) */}
              {isSignup && (
                <div style={{ animation: 'field-appear 0.4s ease-out' }}>
                  <label htmlFor="name" className="block text-[11px] font-semibold text-[#8B6F5E] uppercase tracking-[0.12em] mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#C4A882] group-focus-within:text-[#D4453A] transition-colors duration-300" />
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FDFAF6] border border-[#EDE3D7] rounded-xl text-[#2D1810] text-sm placeholder:text-[#C4A882]/70 focus:outline-none focus:border-[#D4453A]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(212,69,58,0.06)] transition-all duration-300"
                      placeholder="Enter your full name"
                      required={isSignup}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-[11px] font-semibold text-[#8B6F5E] uppercase tracking-[0.12em] mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#C4A882] group-focus-within:text-[#D4453A] transition-colors duration-300" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#FDFAF6] border border-[#EDE3D7] rounded-xl text-[#2D1810] text-sm placeholder:text-[#C4A882]/70 focus:outline-none focus:border-[#D4453A]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(212,69,58,0.06)] transition-all duration-300"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-[11px] font-semibold text-[#8B6F5E] uppercase tracking-[0.12em] mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#C4A882] group-focus-within:text-[#D4453A] transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-[#FDFAF6] border border-[#EDE3D7] rounded-xl text-[#2D1810] text-sm placeholder:text-[#C4A882]/70 focus:outline-none focus:border-[#D4453A]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(212,69,58,0.06)] transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C4A882] hover:text-[#8B6F5E] transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message — fixed height slot so layout never shifts */}
              <div className="min-h-[22px] flex items-center !mt-1">
                {error && (
                  <div
                    className="w-full flex items-start gap-2 px-3 py-1.5 rounded-lg bg-red-50/80 border border-red-100/60"
                    style={{ animation: 'field-appear 0.25s ease-out' }}
                  >
                    <div className="w-1 h-1 rounded-full bg-[#D4453A] shrink-0 mt-[6px]"></div>
                    <p className="text-[#D4453A] text-[11px] leading-[1.3]">{error}</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group/btn text-white py-3 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] !mt-2 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #D4453A 0%, #C13028 100%)',
                  boxShadow: '0 2px 12px -2px rgba(212,69,58,0.3)',
                }}
              >
                {/* Hover shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2.5 relative z-10">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isSignup ? 'Creating account...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-2 my-6">
              <div className="flex-1 h-px bg-[#F0E6DA]"></div>
              <span className="text-[#C4A882] text-xs font-medium">or</span>
              <div className="flex-1 h-px bg-[#F0E6DA]"></div>
            </div>

            {/* Toggle signup/login */}
            <div className="text-center">
              <p className="text-[#8B6F5E] text-sm mb-1 font-light">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
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
                className="text-[#D4453A] font-semibold text-sm hover:text-[#B52820] transition-colors duration-200 inline-flex items-center gap-1.5 group/toggle"
              >
                {isSignup ? 'Sign in instead' : 'Create new account'}
                <ArrowRight className="w-3.5 h-3.5 group-hover/toggle:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[#C4A882] text-xs mt-8 tracking-wide font-light">
            © 2025 Yuno · Connecting people, one spark at a time
          </p>
        </div>
      </div>

      {/* ─── Keyframe animations ─────────────────────────────────────────── */}
      <style jsx>{`
        @keyframes line-glow {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
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
