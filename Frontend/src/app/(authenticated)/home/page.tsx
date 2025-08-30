'use client'

import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { TextGenerateEffect } from '@/components/ui/TextGenerateEffect'
import { Map, BarChart3, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-2">
              <div className="text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-text-primary flex items-center justify-center gap-4">
            <TextGenerateEffect 
              words="Welcome to"
              className="text-text-secondary italic font-light"
            />
            <Logo size="xl" className="w-28 h-28" />
          </h1>
        <div className="mb-4">
                      <TextGenerateEffect 
              words="Shared paths draw us closer. In the noise, we find common ground. Words grow lighter, conversations spark, and strangers no longer feel strange turning silence into connection."
              className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-tight font-normal"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-3">
        {/* Unified Discovery View Card */}
        <Link href="/map" className="group">
          <div className="card-surface p-5 hover:shadow-elegant transition-all duration-300 hover:scale-105 h-40 flex flex-col justify-center">
            <div className="mb-3 flex justify-center">
              <Map className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors text-text-primary text-center">
              Interactive Discovery
            </h3>
            <p className="text-text-muted text-sm text-center leading-relaxed">
              Discover the stories and connections waiting just around the corner
            </p>
          </div>
        </Link>

        {/* Profile Completion Card */}
        <Link href="/profile" className="group">
          <div className="card-surface p-5 hover:shadow-elegant transition-all duration-300 hover:scale-105 h-40 flex flex-col justify-center">
            <div className="mb-3 flex justify-center">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors text-text-primary text-center">
              Complete your profile to start discovering people
            </h3>
            <p className="text-text-muted text-sm text-center leading-relaxed">
              Set up your profile to connect with nearby people
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Link 
            href="/map" 
            className="btn-primary px-3 py-1 text-sm rounded-md shadow-elegant hover:shadow-glow transition-all duration-300 flex items-center gap-1"
          >
            Start Discovering
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-text-muted text-xs">
          Where shared paths become shared conversations
        </p>
      </div>
    </div>
  )
}
