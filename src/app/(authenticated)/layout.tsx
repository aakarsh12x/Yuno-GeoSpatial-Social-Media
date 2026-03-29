'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    console.log('Auth check:', { 
      isAuthenticated, 
      loading, 
      user: user?.name,
      savedToken: savedToken ? 'exists' : 'missing',
      savedUser: savedUser ? 'exists' : 'missing'
    })
    
    // Only redirect if we're not loading and definitely not authenticated
    // Add a small delay to prevent flash
    if (!loading && !isAuthenticated && !savedToken) {
      console.log('Redirecting to login - not authenticated and no saved token')
      const timeoutId = setTimeout(() => {
        router.push('/')
      }, 100) // Small delay to prevent flash
      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated, loading, router, user])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if we have authentication data in localStorage as a fallback
  const savedToken = localStorage.getItem('accessToken')
  const savedUser = localStorage.getItem('user')
  
  // Show loading while redirecting to prevent flash
  if (!isAuthenticated && !savedToken) {
    console.log('No authentication data found, redirecting to login')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </div>
  )
}
