'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  VintageHome, AstrolabeIcon, VintageMessage, 
  VintageSpark, VintageUser, VintageSettings, VintageLogout 
} from './VintageIcons'

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const { logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const navigation = [
    { name: 'Home', href: '/home', icon: VintageHome },
    { name: 'Discover', href: '/map', icon: AstrolabeIcon },
    { name: 'Chat', href: '/chat', icon: VintageMessage },
    { name: 'Sparks', href: '/sparks', icon: VintageSpark },
    { name: 'Profile', href: '/profile', icon: VintageUser },
    { name: 'Settings', href: '/settings', icon: VintageSettings },
  ]

  const isActive = (href: string) => pathname === href

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsCollapsed])

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true)
    }
  }, [pathname, setIsCollapsed])

  // Load user coordinates
  useEffect(() => {
    const cached = localStorage.getItem('yuno_cached_user_location')
    if (cached) {
      try {
        const [lat, lng] = JSON.parse(cached)
        if (typeof lat === 'number' && typeof lng === 'number') {
          setCoords({ lat, lng })
        }
      } catch (e) {}
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoords({ lat: latitude, lng: longitude })
          localStorage.setItem('yuno_cached_user_location', JSON.stringify([latitude, longitude]))
        },
        (error) => {
          console.log('Sidebar location query failed:', error)
        },
        { timeout: 8000 }
      )
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/10 z-30 md:hidden backdrop-blur-[1px]"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] yuno-sidebar flex flex-col transition-all duration-200 z-40 ${
        isCollapsed ? 'w-16 -translate-x-full md:translate-x-0' : 'w-56'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white/20 border border-white/30 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/35 transition-colors shadow-soft"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* Directory Section Header */}
        {!isCollapsed && (
          <div className="px-6 pt-5 pb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-[#54433a]/80">Directory</span>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${
                  active
                    ? 'bg-white text-[#5d4037] font-semibold border border-[#e0d7d0]/90 shadow-[0_2px_4px_rgba(93,64,55,0.04)]'
                    : 'text-[#54433a] hover:text-[#5d4037] hover:bg-[#5d4037]/5'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-250 group-hover:scale-[1.03] ${
                  active ? 'text-[#5d4037]' : 'text-[#795548]/70 group-hover:text-[#5d4037]'
                }`} />
                
                {!isCollapsed && (
                  <span className="text-sm tracking-wide">{item.name}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Cartographic coordinates metadata */}
        {!isCollapsed && (
          <div className="px-6 py-4 text-[10px] font-mono text-[#54433a]/60 border-t border-white/10 space-y-0.5 leading-relaxed">
            <p>
              {coords
                ? `${Math.abs(coords.lat).toFixed(4)}° ${coords.lat >= 0 ? 'N' : 'S'}, ${Math.abs(
                    coords.lng
                  ).toFixed(4)}° ${coords.lng >= 0 ? 'E' : 'W'}`
                : '18.9724° N, 72.8258° E'}
            </p>
          </div>
        )}

        {/* Bottom Section with Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-[#54433a] hover:text-[#b5511b] hover:bg-white/10 rounded-xl transition-all duration-150 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <VintageLogout className="w-[18px] h-[18px] flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
