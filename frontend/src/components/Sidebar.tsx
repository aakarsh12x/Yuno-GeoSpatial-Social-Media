'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import { Home, Compass, User, Settings, ChevronLeft, ChevronRight, LogOut, MessageCircle, Zap } from 'lucide-react'

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const { logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Discover', href: '/map', icon: Compass },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Sparks', href: '/sparks', icon: Zap },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
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
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-border-light flex flex-col transition-all duration-200 z-40 ${
        isCollapsed ? 'w-16 -translate-x-full md:translate-x-0' : 'w-56'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-border-medium rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shadow-soft"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-hover-light'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Bottom Section with Logout */}
        <div className="px-3 py-4 border-t border-border-light">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
