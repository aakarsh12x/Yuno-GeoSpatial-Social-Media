'use client'

import Link from 'next/link'
import { Map, BarChart3, ArrowRight, Sparkles, MapPin } from 'lucide-react'
import LocalActivities from '@/components/LocalActivities'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-6 bg-background">
      {/* Personalized Greeting Section */}
      <div className="w-full max-w-6xl px-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-light pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                Personalized Briefing
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight">
              Welcome back, <span className="text-primary italic">{user?.name?.split(' ')[0] || 'Explorer'}</span>
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              Here is what's trending in your circle today.
            </p>
          </div>
          
          {user?.city && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary">{user.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero: AI Recommendations Section */}
      <div className="w-full max-w-6xl px-4 mb-12">
        <LocalActivities />
      </div>

      {/* Navigation & Next Steps Section */}
      <div className="w-full max-w-6xl px-4 mb-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-text-primary">Continue Your Journey</h2>
          <div className="h-px flex-1 bg-border-light" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Unified Discovery View Card */}
          <Link href="/map" className="group">
            <div className="card-surface p-8 border-border-medium hover:border-primary hover:shadow-elegant transition-all duration-300 h-full flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-hover-light flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <Map className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-text-primary">
                  Interactive Discovery
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  See the stories waiting just around the corner.
                </p>
              </div>
            </div>
          </Link>

          {/* Profile Completion Card */}
          <Link href="/profile" className="group">
            <div className="card-surface p-8 border-border-medium hover:border-primary hover:shadow-elegant transition-all duration-300 h-full flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-hover-light flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <BarChart3 className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-text-primary">
                  Refine My Profile
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Help us build more meaningful connections.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center pb-20">
        <Link
          href="/map"
          className="btn-primary px-8 py-3 rounded-full shadow-elegant hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 font-bold text-base tracking-wide"
        >
          START EXPLORING
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-text-muted text-xs mt-4 italic">
          &ldquo;Shared paths draw us closer.&rdquo;
        </p>
      </div>
    </div>
  )
}
