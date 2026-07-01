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
    <nav className="bg-[#FDFAF6]/90 backdrop-blur-md border-b border-[#EDE7E0] sticky top-0 z-[9999]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
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
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                    active
                      ? 'text-[#1E1616] bg-[#EDE7E0] border border-[#D4C3B3]/40 shadow-sm'
                      : 'text-[#8B7E74] hover:text-[#1E1616] hover:bg-[#F5EFE6]/60'
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
                className="flex items-center gap-2 p-1 pr-3 border border-[#EDE7E0] hover:border-[#D4C3B3] rounded-full bg-[#FDFAF6] transition-all hover:shadow-sm"
              >
                <div className="w-7 h-7 bg-[#EDE7E0] text-[#D4453A] rounded-full flex items-center justify-center font-bold text-xs border border-[#D4C3B3]/25">
                  {user?.name?.[0]?.toUpperCase() || <VintageUser className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#1E1616] hidden sm:block font-medium">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8B7E74] transition-transform duration-200" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#FDFAF6] border border-[#EDE7E0] rounded-xl shadow-[0_4px_20px_-2px_rgba(30,22,22,0.12)] py-1.5 z-50 overflow-hidden" style={{ animation: 'field-appear 0.2s ease-out' }}>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#8B7E74] hover:text-[#1E1616] hover:bg-[#EDE7E0]/40 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <VintageUser className="w-4 h-4 text-[#D4453A]" />
                    <span>View Profile</span>
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#8B7E74] hover:text-[#1E1616] hover:bg-[#EDE7E0]/40 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <VintageSettings className="w-4 h-4 text-[#D4453A]" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-[#EDE7E0] my-1.5" />
                  <button 
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-red-600 hover:bg-red-50/60 transition-colors"
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
      </div>
    </nav>
  )
}
