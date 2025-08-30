'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import { Bell, User, ChevronDown, Menu, Settings, LogOut } from 'lucide-react'

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { setIsCollapsed } = useSidebar()
  const { logout, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home'
    return pathname === href
  }

  return (
    <nav className="bg-surface/90 backdrop-blur-md border-b border-border-medium sticky top-0 z-[9999] shadow-soft">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Only - Moved Further Left */}
          <div className="flex items-center">
            <Link href="/" className="group">
              <div className="w-30 h-26 group-hover:scale-110 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Yuno Logo"
                  width={96}
                  height={64}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              <Link 
                href="/home" 
                className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden font-bold text-base ${
                  isActive('/home')
                    ? 'text-primary bg-primary/5 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover-light/50 hover:translate-x-1'
                }`}
              >
                <span className="relative z-10">Home</span>
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
              <Link 
                href="/map" 
                className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden font-bold text-base ${
                  isActive('/map')
                    ? 'text-primary bg-primary/5 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover-light/50 hover:translate-x-1'
                }`}
              >
                <span className="relative z-10">Discover</span>
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
              <Link 
                href="/profile" 
                className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden font-bold text-base ${
                  isActive('/profile')
                    ? 'text-primary bg-primary/5 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover-light/50 hover:translate-x-1'
                }`}
              >
                <span className="relative z-10">Profile</span>
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
            </div>
          </div>

          {/* User Profile Section - Moved Further Right */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsCollapsed(false)}
              className="md:hidden p-2 text-text-muted hover:text-text-primary hover:bg-hover-light rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-hover-light rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-hover-light rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-soft">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm text-text-secondary hidden sm:block">{user?.name || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface/95 backdrop-blur-md border border-border-medium rounded-lg shadow-elegant py-2 z-50">
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover-light hover:text-text-primary transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover-light hover:text-text-primary transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-border-light my-2" />
                  <button 
                    className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      logout()
                      setIsProfileOpen(false)
                      router.push('/')
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
