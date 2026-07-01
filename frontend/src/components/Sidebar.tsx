'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
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
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#FDFAF6] border-r border-border-light flex flex-col transition-all duration-200 z-40 ${
        isCollapsed ? 'w-16 -translate-x-full md:translate-x-0' : 'w-56'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-[#FDFAF6] border border-border-medium rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shadow-soft"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* Directory Section Header */}
        {!isCollapsed && (
          <div className="px-6 pt-5 pb-2 border-b border-border-light/40">
            <span className="text-[10px] font-mono text-text-muted/70 tracking-widest uppercase">MAP DIRECTORY</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group ${
                  active
                    ? 'bg-[#EDE7E0] text-text-primary font-semibold shadow-[inset_0_1px_2px_rgba(26,15,10,0.03)]'
                    : 'text-text-muted hover:text-text-primary hover:bg-[#F5F2EE]'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {/* Active selection accent line */}
                {active && !isCollapsed && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-[#D4453A]" />
                )}
                
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105 ${
                  active ? 'text-[#D4453A]' : 'text-[#795548]/70 group-hover:text-[#1A0F0A]'
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
          <div className="px-6 py-4 text-[10px] font-mono text-text-muted/50 border-t border-border-light/40 space-y-0.5 leading-relaxed">
            <p>LOC // 18.9724° N, 72.8258° E</p>
            <p>REF // CARTOGRAPHERS_HEARTH</p>
          </div>
        )}

        {/* Bottom Section with Logout */}
        <div className="px-3 py-4 border-t border-border-light/60">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-[#B71C1C] hover:bg-[#B71C1C]/5 rounded-xl transition-all duration-150 ${
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
