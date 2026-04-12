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
              width: 12px; 
              height: 12px; 
              border-radius: 50%; 
              border: 2px solid #FFFFFF; 
              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            "></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })
        }

        // Add radius circles for discovery ranges
        const radiusColors = {
          5: '#5D4037',    // Primary brown
          10: '#8B4513',   // Accent leather
          20: '#D4C4B8'    // Muted border
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
        // Add current user marker
        L.marker(userLocation, { icon: createMarkerIcon('#5D4037') })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 12px; font-family: Inter, sans-serif;">
              <strong style="color: #1A0F0A; display: block; margin-bottom: 4px;">My Location</strong>
              <span style="color: #795548; font-size: 11px;">Discovery active within 20km</span>
            </div>
          `)

        // Add nearby user markers
        users.forEach(user => {
          L.marker([user.lat, user.lng], { icon: createMarkerIcon('#8B4513') })
            .addTo(map)
            .bindPopup(`
              <div style="padding: 12px; min-width: 200px; font-family: Inter, sans-serif;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <div style="
                    width: 32px; 
                    height: 32px; 
                    border-radius: 50%; 
                    background: #5D4037; 
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                  ">
                    ${user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <strong style="color: #1A0F0A; font-size: 14px;">${user.name}</strong>
                    ${user.distance ? `<br><span style="color: #795548; font-size: 11px;">${user.distance}km away</span>` : ''}
                  </div>
                </div>
                
                ${user.common.length > 0 ? `
                  <div style="margin-bottom: 12px;">
                    <div style="color: #1A0F0A; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Common Ground</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                      ${user.common.map(item => 
                        `<span style="
                          display: inline-block;
                          padding: 2px 6px; 
                          background: #F5F2EE; 
                          color: #5D4037; 
                          border: 1px solid #E0D7D0;
                          border-radius: 4px; 
                          font-size: 10px;
                          font-weight: 600;
                        ">${item}</span>`
                      ).join('')}
                    </div>
                  </div>
                ` : ''}
                
                <button style="
                  width: 100%; 
                  background: #5D4037; 
                  color: white; 
                  padding: 8px; 
                  border: none; 
                  border-radius: 6px; 
                  cursor: pointer;
                  font-size: 12px;
                  font-weight: 600;
                  transition: background 0.2s;
                ">
                  Send Spark
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
              <h4 style="margin: 0 0 12px 0; color: #1A0F0A; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Map Legend</h4>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 10px; height: 10px; background: #5D4037; border-radius: 50%; margin-right: 10px; border: 1px solid white;"></div>
                <span style="color: #3E2723; font-weight: 500;">Inner Circle (5km)</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 10px; height: 10px; background: #8B4513; border-radius: 50%; margin-right: 10px; border: 1px solid white;"></div>
                <span style="color: #3E2723; font-weight: 500;">Middle Range (10km)</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 10px; height: 10px; background: #C6B8AF; border-radius: 50%; margin-right: 10px; border: 1px solid white;"></div>
                <span style="color: #3E2723; font-weight: 500;">Extended Area (20km)</span>
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