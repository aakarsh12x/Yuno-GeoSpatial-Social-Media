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
  bio?: string
  username?: string
  profession?: string
  languages?: string
  skills?: string
  clubs?: string
  favoriteShows?: string
  favoriteMovies?: string
  favoriteMusic?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

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

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('Login attempt for:', email)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: false, message: text || `Server error: ${response.status} ${response.statusText}` };
      }
      console.log('Login response:', data)

      if (data.success && data.data?.tokens?.accessToken) {
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
        return { success: true }
      } else {
        console.error('Login failed:', data.message || 'Unknown error')
        return { success: false, message: data.message || 'Login failed. Please check your credentials.' }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, message: error.message || 'An error occurred during login.' }
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
    updateUser,
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
