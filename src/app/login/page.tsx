'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, Lock, Eye, EyeOff, MapPin, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-[#FEFCF9] relative overflow-hidden">

      {/* Warm gradient background wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 70% 0%, rgba(255,228,200,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 0% 100%, rgba(212,69,58,0.06) 0%, transparent 40%),
            radial-gradient(ellipse at 100% 80%, rgba(238,182,138,0.15) 0%, transparent 40%)
          `,
        }}
      />

      {/* Dotted grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #8B4513 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-64 h-64 rounded-full border border-[#EEB68A]/20"
          style={{ top: '5%', right: '8%', animation: 'orbit 22s linear infinite' }}
        />
        <div
          className="absolute w-40 h-40 rounded-full border border-[#D4453A]/8"
          style={{ bottom: '10%', left: '5%', animation: 'orbit 28s linear infinite reverse' }}
        />

        {/* Small floating glass card - top right */}
        <div
          className="absolute top-[12%] right-[6%] bg-white/50 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-md hidden md:block"
          style={{ animation: 'float-card 6s ease-in-out infinite', width: '150px' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[#D4453A]/10 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-[#D4453A]" />
            </div>
            <span className="text-[#4A2C20] text-[10px] font-semibold">Nearby</span>
          </div>
          <p className="text-[#8B6F5E] text-[9px]">12 people within 2km</p>
        </div>

        {/* Small floating glass card - bottom left */}
        <div
          className="absolute bottom-[15%] left-[4%] bg-white/50 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-md hidden md:block"
          style={{ animation: 'float-card 7s ease-in-out infinite 3s', width: '140px' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="text-[#4A2C20] text-[10px] font-semibold">Match</span>
          </div>
          <p className="text-[#8B6F5E] text-[9px]">You both love hiking!</p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-[420px] transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="relative w-36 h-36 mx-auto mb-1">
              <Image
                src="/logo.png"
                alt="Yuno Logo"
                fill
                className="object-contain"
                sizes="144px"
                priority
              />
            </div>
            <p className="text-[#7A5C4F] text-sm font-light tracking-wide">
              Connect with people nearby
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-3xl border border-[#F0E6DA] shadow-[0_2px_24px_-4px_rgba(139,69,19,0.08),0_12px_48px_-12px_rgba(139,69,19,0.06)] p-8 lg:p-10">
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-1 rounded-full bg-[#D4453A]"></div>
                <div className="w-2 h-1 rounded-full bg-[#D4453A]/40"></div>
              </div>
              <h2 className="text-[#2D1810] text-2xl font-bold tracking-tight">
                Sign In
              </h2>
              <p className="text-[#8B6F5E] text-sm mt-2">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[11px] font-semibold text-[#8B6F5E] uppercase tracking-[0.12em] mb-1.5">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#C4A882] group-focus-within:text-[#D4453A] transition-colors duration-300" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#FDFAF6] border border-[#EDE3D7] rounded-xl text-[#2D1810] text-sm placeholder:text-[#C4A882] focus:outline-none focus:border-[#D4453A]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(212,69,58,0.08)] transition-all duration-300"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[11px] font-semibold text-[#8B6F5E] uppercase tracking-[0.12em] mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#C4A882] group-focus-within:text-[#D4453A] transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-[#FDFAF6] border border-[#EDE3D7] rounded-xl text-[#2D1810] text-sm placeholder:text-[#C4A882] focus:outline-none focus:border-[#D4453A]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(212,69,58,0.08)] transition-all duration-300"
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

              {/* Error */}
              {error && (
                <div
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100"
                  style={{ animation: 'field-appear 0.3s ease-out' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4453A] shrink-0 mt-1.5"></div>
                  <p className="text-[#D4453A] text-sm leading-snug">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group/btn text-white py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] mt-1 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #D4453A 0%, #C13028 50%, #B52820 100%)',
                  boxShadow: '0 4px 16px -2px rgba(212,69,58,0.35), 0 1px 3px rgba(212,69,58,0.2)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2.5 relative z-10">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-5 border-t border-[#F0E6DA]">
              <p className="text-[#C4A882] text-xs text-center tracking-wide">
                Demo: user123@example.com / user
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[#C4A882] text-xs mt-6 tracking-wide">
            © 2024 Yuno · Connecting people, one spark at a time
          </p>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
