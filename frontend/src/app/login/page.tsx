'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Compass,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import GeospatialBackground from '@/components/GeospatialBackground'
import GlassSurface from '@/components/ui/GlassSurface'
import Image from 'next/image'
import Link from 'next/link'

function AuthForm() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup'

  const [isSignup, setIsSignup] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, loading, router])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (isSignup) {
      if (!name.trim()) { setError('Name is required'); setIsLoading(false); return }
      if (!email.trim()) { setError('Email is required'); setIsLoading(false); return }
      if (!password.trim()) { setError('Password is required'); setIsLoading(false); return }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setIsLoading(false); return }
    } else {
      if (!email.trim()) { setError('Email is required'); setIsLoading(false); return }
      if (!password.trim()) { setError('Password is required'); setIsLoading(false); return }
    }

    try {
      if (isSignup) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.message || 'Registration failed')
          return
        }

        const data = await response.json()
        if (data.success) {
          const loginResult = await login(email, password)
          if (loginResult.success) router.push('/home')
          else setError(loginResult.message || 'Login failed.')
        } else {
          setError(data.message || 'Registration failed.')
        }
      } else {
        const loginResult = await login(email, password)
        if (loginResult.success) router.push('/home')
        else setError(loginResult.message || 'Login failed. Please check your credentials.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden font-sans text-[#231b15] flex flex-col justify-between selection:bg-[#fcead2] selection:text-[#54433a]">
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
        {/* Subtle blur to make form readable */}
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
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex justify-center pointer-events-auto">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={24}
          borderWidth={0.06}
          brightness={99}
          opacity={0.05}
          blur={15}
          backgroundOpacity={0.05}
          className="border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_32px_rgba(181,81,27,0.06)]"
        >
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-xs text-[#54433a] hover:text-[#b5511b] font-mono uppercase tracking-wider transition-colors duration-200 group font-bold"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back
            </button>

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

            {/* Balance spacing element */}
            <div className="w-12" />
          </div>
        </GlassSurface>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Glass Visual & Description */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6 hidden lg:block text-[#231b15]">
            <motion.h1 
              className="text-[#1a0f0a] text-4xl lg:text-5xl font-display italic font-medium tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {isSignup ? (
                <>
                  Step onto the grid. <br />
                  Initialize your node.
                </>
              ) : (
                <>
                  Resolve location. <br />
                  Access the index.
                </>
              )}
            </motion.h1>

            <motion.p 
              className="text-[#54433a] text-sm leading-relaxed max-w-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isSignup
                ? 'Join Yuno to catalog live local coordinates, connect with other user nodes, and sync field notes instantly.'
                : 'Sign in to access your dashboard coordinates. The geospatial city pulse updates in real time.'}
            </motion.p>
          </div>

          {/* Right Column: Floating Frosted Glass Login Card */}
          <motion.div 
            className="lg:col-span-6 flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-full max-w-[420px] yuno-card p-8 text-[#231b15] relative overflow-hidden group">
              
              {/* Header */}
              <div className="mb-8 border-b border-[#ebdcd0]/30 pb-4">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#54433a]/60">
                  <span>WELCOME TO YUNO</span>
                  <span>PORTAL</span>
                </div>
                <h2 className="text-[#1a0f0a] text-xl font-display italic font-medium tracking-tight mt-3">
                  {isSignup ? 'Create Account' : 'Sign In'}
                </h2>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                
                {/* Full Name (Sign up only) */}
                {isSignup && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-[10px] font-mono uppercase tracking-wider text-[#54433a] font-bold"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#54433a]/40" />
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-[#e0d7d0] hover:border-[#5d4037] focus:border-[#5d4037] rounded-xl text-[#231b15] text-xs placeholder:text-[#54433a]/40 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/15 transition-all duration-200 shadow-sm"
                        placeholder="Your Name"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-[10px] font-mono uppercase tracking-wider text-[#54433a] font-bold"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#54433a]/40" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-[#e0d7d0] hover:border-[#5d4037] focus:border-[#5d4037] rounded-xl text-[#231b15] text-xs placeholder:text-[#54433a]/40 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/15 transition-all duration-200 shadow-sm"
                      placeholder="you@domain.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-[10px] font-mono uppercase tracking-wider text-[#54433a] font-bold"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#54433a]/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/80 border border-[#e0d7d0] hover:border-[#5d4037] focus:border-[#5d4037] rounded-xl text-[#231b15] text-xs placeholder:text-[#54433a]/40 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/15 transition-all duration-200 shadow-sm"
                      placeholder="••••••••"
                      autoComplete={isSignup ? 'new-password' : 'current-password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#54433a]/40 hover:text-[#231b15] transition-colors duration-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50/80 border border-red-200/50 backdrop-blur-sm">
                    <p className="text-red-800 text-[10px] leading-[1.4] font-mono">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#b5511b] hover:bg-[#943b0d] text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(181,81,27,0.12)] hover:shadow-[0_4px_16px_rgba(148,59,13,0.15)]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Please wait...</span>
                      </>
                    ) : (
                      <>
                        <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Option Switcher Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[#ebdcd0]/30" />
                <span className="text-[#54433a]/40 font-mono text-[9px] uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-[#ebdcd0]/30" />
              </div>

              {/* Form toggle link */}
              <div className="text-center space-y-1">
                <p className="text-[#54433a]/70 text-xs font-light">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <button
                  id="auth-toggle-btn"
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup)
                    resetForm()
                  }}
                  className="text-[#b5511b] font-mono font-bold text-xs uppercase tracking-widest hover:text-[#54433a] transition-colors duration-200 inline-flex items-center gap-1 group"
                >
                  {isSignup ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Compass className="w-10 h-10 text-[#54433a] animate-spin [animation-duration:6s]" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
