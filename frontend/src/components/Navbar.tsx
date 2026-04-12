'use client'

import { useState, useRef, useEffect } from 'react'
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => pathname === href

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = [
    { name: 'Home', href: '/home' },
    { name: 'Discover', href: '/map' },
    { name: 'Profile', href: '/profile' },
  ]

  return (
    <nav className="bg-white border-b border-border-light sticky top-0 z-[9999]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Yuno"
                width={80}
                height={48}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-primary bg-hover-light'
                    : 'text-text-muted hover:text-text-primary hover:bg-hover-light'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsCollapsed(false)}
              className="md:hidden p-2 text-text-muted hover:text-text-primary rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-text-muted hover:text-text-primary rounded-lg transition-colors">
              <Bell className="w-[18px] h-[18px]" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 border border-border-light hover:border-border-medium rounded-full transition-colors"
              >
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm text-text-secondary hidden sm:block font-medium">{user?.name || 'User'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-border-light rounded-lg shadow-elegant py-1 z-50">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover-light transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover-light transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-border-light my-1" />
                  <button 
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
