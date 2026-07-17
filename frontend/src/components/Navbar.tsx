'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import { ChevronDown } from 'lucide-react'
import { 
  VintageMenu, VintageBell, VintageUser, 
  VintageSettings, VintageLogout 
} from './VintageIcons'
import GlassSurface from '@/components/ui/GlassSurface'

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
    <div className="fixed top-4 left-0 right-0 z-[9999] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex justify-center pointer-events-auto">
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={24}
        borderWidth={0.06}
        brightness={99}
        opacity={0.55}
        blur={15}
        backgroundOpacity={0.55}
        className="!overflow-visible border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_32px_rgba(84,67,58,0.06)]"
      >
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Image
                src="/logo.png"
                alt="Yuno"
                width={85}
                height={50}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-[#5d4037]/5 border border-[#5d4037]/10 rounded-full p-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                    active
                      ? 'text-[#5d4037] bg-white border border-[#e0d7d0]/80 shadow-[0_1px_2px_rgba(93,64,55,0.05)] font-bold'
                      : 'text-[#54433a] hover:text-[#5d4037] hover:bg-white/40'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsCollapsed(false)}
              className="md:hidden p-2 text-[#8B7E74] hover:text-[#1E1616] hover:bg-[#EDE7E0]/40 rounded-lg transition-colors"
            >
              <VintageMenu className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-[#8B7E74] hover:text-[#1E1616] hover:bg-[#EDE7E0]/40 rounded-lg transition-all relative">
              <VintageBell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4453A] rounded-full animate-pulse" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pr-3 border border-[#e0d7d0] hover:border-[#5d4037] rounded-full bg-white/80 backdrop-blur-md transition-all hover:shadow-sm"
              >
                <div className="w-7 h-7 bg-[#5d4037]/10 text-[#5d4037] rounded-full flex items-center justify-center font-bold text-xs border border-[#5d4037]/15">
                  {user?.name?.[0]?.toUpperCase() || <VintageUser className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#231b15] hidden sm:block font-medium">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#54433a] transition-transform duration-200" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 yuno-card p-1.5 border-[#e0d7d0]/80 shadow-lg z-50 overflow-hidden" style={{ animation: 'field-appear 0.2s ease-out' }}>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#54433a] hover:text-[#231b15] hover:bg-[#5d4037]/5 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <VintageUser className="w-4 h-4 text-[#b5511b]" />
                    <span>View Profile</span>
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#54433a] hover:text-[#231b15] hover:bg-[#5d4037]/5 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <VintageSettings className="w-4 h-4 text-[#b5511b]" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-[#e0d7d0]/50 my-1" />
                  <button 
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-red-600 hover:bg-red-500/5 transition-colors"
                    onClick={() => {
                      logout()
                      setIsProfileOpen(false)
                      router.push('/')
                    }}
                  >
                    <VintageLogout className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassSurface>
    </div>
  )
}
