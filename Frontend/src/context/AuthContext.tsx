'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
  age: number
  city: string
  school?: string
  college?: string
  workplace?: string
  interests: string[]
  latitude?: number
  longitude?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    
    console.log('AuthContext initialization:', { 
      savedToken: savedToken ? 'exists' : 'missing',
      savedUser: savedUser ? 'exists' : 'missing'
    })
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(userData)
        console.log('Restored authentication state:', { token: !!savedToken, user: userData.name })
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt for:', email)
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (data.success && data.data.tokens.accessToken) {
        const accessToken = data.data.tokens.accessToken
        const userData = data.data.user

        console.log('Setting authentication state:', { accessToken: !!accessToken, user: userData.name })

        // Update state synchronously
        setToken(accessToken)
        setUser(userData)

        // Save to localStorage
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))

        console.log('Authentication state updated successfully')
        return true
      } else {
        console.error('Login failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!token
  
  // Debug authentication state changes
  useEffect(() => {
    console.log('AuthContext state changed:', { 
      isAuthenticated, 
      hasToken: !!token, 
      hasUser: !!user,
      user: user?.name 
    })
  }, [isAuthenticated, token, user])

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
