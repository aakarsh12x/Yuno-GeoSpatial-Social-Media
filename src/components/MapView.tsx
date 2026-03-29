'use client'

import { useEffect, useState, useRef } from 'react'

interface User {
  id: number
  name: string
  lat: number
  lng: number
  common: string[]
  distance?: number
}

interface MapViewProps {
  users: User[]
  className?: string
}

export default function MapView({ users, className = '' }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)

  // Get user location - only runs once
  useEffect(() => {
    if ('geolocation' in navigator) {
      const timeoutId = setTimeout(() => {
        console.log('⏱️ Geolocation timeout, using fallback')
        setError('Location timeout. Using default location (Bhopal, India).')
        setUserLocation([23.2257, 77.3867])
        setLoading(false)
      }, 8000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          const { latitude, longitude } = position.coords
          console.log('📍 Location obtained:', { latitude, longitude })
          setUserLocation([latitude, longitude])
          setLoading(false)
        },
        (geoError) => {
          clearTimeout(timeoutId)
          console.error('❌ Geolocation error:', geoError)
          setError('Location access denied. Using default location (Bhopal, India).')
          setUserLocation([23.2257, 77.3867])
          setLoading(false)
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 0 }
      )
    } else {
      setError('Geolocation not supported.')
      setUserLocation([23.2257, 77.3867])
      setLoading(false)
    }
  }, [])

  // Initialize map - only when location is ready and not already initialized
  useEffect(() => {
    if (!userLocation || !mapContainerRef.current || mapInitialized.current) {
      return
    }

    const initMap = async () => {
      try {
        console.log('🗺️ Initializing map...')
        mapInitialized.current = true

        // Dynamic import of Leaflet
        const L = (await import('leaflet')).default

        // Create map with the container directly
        const map = L.map(mapContainerRef.current!, {
          center: userLocation,
          zoom: 13,
          scrollWheelZoom: true
        })

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map)

        // Create simple marker icon
        const createMarkerIcon = (color: string) => {
          return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background: ${color}; 
              width: 20px; 
              height: 20px; 
              border-radius: 50%; 
              border: 2px solid white; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 20]
          })
        }

        // Add radius circles for discovery ranges
        const radiusColors = {
          5: '#8B4513',    // Primary color for 5km
          10: '#D4A574',   // Accent color for 10km  
          20: '#E8E0D8'    // Light color for 20km
        }

        // Add radius circles
        Object.entries(radiusColors).forEach(([radius, color]) => {
          L.circle(userLocation, {
            radius: parseInt(radius) * 1000, // Convert km to meters
            color: color,
            fillColor: color,
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.6
          }).addTo(map).bindTooltip(`${radius}km radius`, { permanent: false, direction: 'center' })
        })

        // Add current user marker
        L.marker(userLocation, { icon: createMarkerIcon('#8B4513') })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 8px;">
              <strong>You are here</strong>
              <br><small>Discovery radius: 5km, 10km, 20km</small>
            </div>
          `)

        // Add nearby user markers
        users.forEach(user => {
          L.marker([user.lat, user.lng], { icon: createMarkerIcon('#D4A574') })
            .addTo(map)
            .bindPopup(`
              <div style="padding: 10px; min-width: 180px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <div style="
                    width: 30px; 
                    height: 30px; 
                    border-radius: 50%; 
                    background: #8B4513; 
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-weight: bold;
                  ">
                    ${user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <strong>${user.name}</strong>
                    ${user.distance ? `<br><small>${user.distance}km away</small>` : ''}
                  </div>
                </div>
                
                ${user.common.length > 0 ? `
                  <div style="margin-bottom: 8px;">
                    <small><strong>Common interests:</strong></small>
                    <div style="margin-top: 4px;">
                      ${user.common.map(item => 
                        `<span style="
                          display: inline-block;
                          padding: 2px 6px; 
                          background: #F0EBE3; 
                          color: #8B4513; 
                          border-radius: 8px; 
                          font-size: 10px;
                          margin: 1px;
                        ">${item}</span>`
                      ).join('')}
                    </div>
                  </div>
                ` : ''}
                
                <button onclick="alert('Chat feature coming soon!')" style="
                  width: 100%; 
                  background: #8B4513; 
                  color: white; 
                  padding: 6px; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 12px;
                ">
                  Start Chat
                </button>
              </div>
            `)
        })

        // Add legend to explain radius circles
        const LegendControl = L.Control.extend({
          onAdd: function() {
            const div = L.DomUtil.create('div', 'info legend')
            div.style.backgroundColor = 'white'
            div.style.padding = '10px'
            div.style.border = '2px solid #8B4513'
            div.style.borderRadius = '8px'
            div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            div.style.fontSize = '12px'
            div.style.fontFamily = 'Inter, sans-serif'
            
            div.innerHTML = `
              <h4 style="margin: 0 0 8px 0; color: #2D1810; font-weight: 600;">Discovery Radius</h4>
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: #8B4513; border-radius: 50%; margin-right: 8px;"></div>
                <span>5km - Close connections</span>
              </div>
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: #D4A574; border-radius: 50%; margin-right: 8px;"></div>
                <span>10km - Nearby area</span>
              </div>
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: #E8E0D8; border-radius: 50%; margin-right: 8px;"></div>
                <span>20km - Extended reach</span>
              </div>
            `
            return div
          }
        })
        new LegendControl({ position: 'bottomright' }).addTo(map)

        setMapInstance(map)
        console.log('✅ Map initialized successfully')

      } catch (error) {
        console.error('❌ Map initialization failed:', error)
        setError('Failed to load map.')
        mapInitialized.current = false
      }
    }

    initMap()
  }, [userLocation, users])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance) {
        console.log('🗺️ Cleaning up map...')
        try {
          mapInstance.remove()
        } catch {
          console.log('Map cleanup completed')
        }
      }
    }
  }, [mapInstance])

  if (loading) {
    return (
      <div className={`rounded-2xl bg-surface border border-border-light overflow-hidden shadow-soft ${className}`}>
        <div className="h-[500px] w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Getting your location...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl bg-surface border border-border-light overflow-hidden shadow-soft relative z-10 ${className}`}>
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4 rounded-t-2xl">
          <p className="text-yellow-700 text-sm">{error}</p>
        </div>
      )}
      
      <div 
        ref={mapContainerRef}
        className="h-[500px] w-full relative z-10"
        style={{ background: '#f8f6f0' }}
      />
    </div>
  )
}