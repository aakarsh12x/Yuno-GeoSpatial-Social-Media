'use client'

import { useSidebar } from '@/context/SidebarContext'
import { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
}

export default function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebar()

  return (
    <main className={`pt-20 transition-all duration-300 ${
      isCollapsed ? 'pl-0 md:pl-16' : 'pl-0 md:pl-64'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  )
}
