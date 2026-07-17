'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import { Toaster } from 'react-hot-toast'

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
      <div className="min-h-screen relative overflow-x-hidden font-sans text-[#231b15]">
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-warm-gradient">
          <div className="absolute inset-0 bg-[#f8f6f0]/10 backdrop-blur-[2px] z-0" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center yuno-card p-8 max-w-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b5511b] mx-auto mb-4"></div>
            <p className="text-[#54433a]/80 text-sm font-medium">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if we have authentication data in localStorage as a fallback
  const savedToken = localStorage.getItem('accessToken')
  
  // Show loading while redirecting to prevent flash
  if (!isAuthenticated && !savedToken) {
    console.log('No authentication data found, redirecting to login')
    return (
      <div className="min-h-screen relative overflow-x-hidden font-sans text-[#231b15]">
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-warm-gradient">
          <div className="absolute inset-0 bg-[#f8f6f0]/10 backdrop-blur-[2px] z-0" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center yuno-card p-8 max-w-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b5511b] mx-auto mb-4"></div>
            <p className="text-[#54433a]/80 text-sm font-medium">Redirecting...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans text-[#231b15]">
      {/* Fullscreen bg-warm-gradient background */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-warm-gradient">
        {/* Subtle blur */}
        <div className="absolute inset-0 bg-[#f8f6f0]/10 backdrop-blur-[2px] z-0" />
        
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

      <div className="relative z-10">
        <Navbar />
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
