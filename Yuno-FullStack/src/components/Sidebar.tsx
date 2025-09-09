'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useEffect } from 'react'
import { Home, BookOpen, User, Settings, ChevronRight, LogOut, MessageCircle, Zap } from 'lucide-react'

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Discover', href: '/map', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Chat', href: '/chat', icon: <MessageCircle className="w-5 h-5" /> },
    { name: 'Sparks', href: '/sparks', icon: <Zap className="w-5 h-5" /> },
    { name: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
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
      <div className={`fixed left-0 top-16 h-full bg-surface/90 backdrop-blur-md border-r border-border-medium transition-all duration-300 z-40 shadow-soft ${
        isCollapsed ? 'w-16 -translate-x-full md:translate-x-0' : 'w-64'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-elegant hover:bg-primary/90 transition-colors"
        >
          <ChevronRight
            className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Navigation Links */}
        <div className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive(item.href)
                  ? 'text-primary bg-primary/5 border-l-4 border-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-hover-light/50 hover:translate-x-1'
              }`}
            >
              {/* Active indicator dot */}
              {isActive(item.href) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              
              <span className={`flex items-center justify-center transition-all duration-200 ${
                isActive(item.href) ? 'text-primary' : 'group-hover:scale-110'
              }`}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className={`font-medium transition-all duration-200 ${
                  isActive(item.href) ? 'text-primary font-semibold' : ''
                }`}>
                  {item.name}
                </span>
              )}
              
              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </Link>
          ))}
        </div>

        {/* Bottom Section with Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light/50">
          {/* Logout Button */}
          <button
            onClick={() => {
              // TODO: Implement logout functionality
              console.log('Logout clicked')
            }}
            className={`w-full flex items-center space-x-3 px-3 py-3 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-300 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {!isCollapsed && (
              <span className="font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
