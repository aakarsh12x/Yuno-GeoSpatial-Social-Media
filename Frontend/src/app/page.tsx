'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to home
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        // Handle signup
        const requestBody = { name: name.trim(), email: email.trim(), password: password.trim() }
        console.log('Sending registration request:', requestBody)
        console.log('Form values:', { name, email, password })
        
        const response = await fetch('http://localhost:5000/api/auth/register', {
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
          // Auto-login after successful signup
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
        // Handle login
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-between p-8">
      {/* Logo Section - Left Side */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative w-56 h-56 mb-0 animate-fade-in">
            <Image
              src="/logo.png"
              alt="Yuno Logo"
              fill
              className="object-contain"
              sizes="224px"
            />
          </div>
          <h1 className="text-3xl font-bold italic text-gradient mb-2 font-serif -mt-6 animate-slide-up">
            Welcome to Yuno
          </h1>
          <p className="text-text-secondary text-xl animate-slide-up-delay">
            Connect with people nearby
          </p>
        </div>
      </div>

      {/* Login Form - Right Side */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md">
          <div className="card-surface p-8 rounded-2xl border border-border-medium shadow-glow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                {isSignup ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-text-secondary">
                {isSignup ? 'Join Yuno and connect with people nearby' : 'Enter your credentials to continue'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignup && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-4 pr-4 py-4 bg-surface border border-border-medium rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                      placeholder="Enter your full name"
                      required={isSignup}
                    />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface border border-border-medium rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-surface border border-border-medium rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{isSignup ? 'Creating account...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-secondary text-sm mb-4">
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
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {isSignup ? 'Sign in instead' : 'Create new account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
