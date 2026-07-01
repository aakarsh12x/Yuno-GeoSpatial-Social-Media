'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { EventsAPI, PlacesAPI } from '@/lib/api'

interface User {
  id: number
  name: string
  lat: number
  lng: number
  common: string[]
  distance?: number
}

interface EventPin {
  id: number
  title: string
  description: string
  category: string
  vibe: string
  source_url: string | null
  subreddit: string | null
  reddit_score: number
  latitude: number
  longitude: number
  location_name: string | null
  distance_km: number
}

interface PlacePin {
  id: string
  name: string
  category: string
  description: string | null
  latitude: number
  longitude: number
  website: string | null
}

interface MapViewProps {
  users: User[]
  className?: string
}

export default function MapView({ users, className = '' }: MapViewProps) {
  const searchParams = useSearchParams()
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const questName = searchParams.get('questName')

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [eventPins, setEventPins] = useState<EventPin[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('yuno_cached_event_pins');
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        console.error('Error reading cached event pins', e);
        return [];
      }
    }
    return [];
  })
  const [placePins, setPlacePins] = useState<PlacePin[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('yuno_cached_place_pins');
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        console.error('Error reading cached place pins', e);
        return [];
      }
    }
    return [];
  })
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)

  // Helper to fetch and cache pins
  const fetchAndCachePins = (lat: number, lng: number) => {
    Promise.allSettled([
      EventsAPI.getNearby(lat, lng, 15),
      PlacesAPI.getNearby(lat, lng, 10),
    ]).then(([eventsRes, placesRes]) => {
      if (eventsRes.status === 'fulfilled') {
        const data = eventsRes.value.data?.data || [];
        setEventPins(data);
        try {
          localStorage.setItem('yuno_cached_event_pins', JSON.stringify(data));
        } catch (e) {
          console.error('Failed to cache event pins', e);
        }
      }
      if (placesRes.status === 'fulfilled') {
        const data = placesRes.value.data?.data || [];
        setPlacePins(data);
        try {
          localStorage.setItem('yuno_cached_place_pins', JSON.stringify(data));
        } catch (e) {
          console.error('Failed to cache place pins', e);
        }
      }
    });
  };

  // Get user location & cache check - only runs once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedLoc = localStorage.getItem('yuno_cached_user_location');
        const lastFetch = localStorage.getItem('yuno_last_fetch_time');
        
        if (cachedLoc && lastFetch) {
          const timePassed = Date.now() - Number(lastFetch);
          // If fetched within 5 minutes, reuse location and cached pins without refetching
          if (timePassed < 5 * 60 * 1000) {
            const locCoords = JSON.parse(cachedLoc);
            console.log('⚡ Using cached user location and pins:', locCoords);
            setUserLocation(locCoords);
            setLoading(false);
            return; // Skip geolocation and fetch
          }
        }
      } catch (e) {
        console.error('Failed to parse cached user location', e);
      }
    }

    if ('geolocation' in navigator) {
      const timeoutId = setTimeout(() => {
        console.log('⏱️ Geolocation timeout, using fallback')
        setError('Location timeout. Using default location (Bhopal, India).')
        const fallbackLoc: [number, number] = [23.2257, 77.3867];
        setUserLocation(fallbackLoc)
        setLoading(false)
        fetchAndCachePins(fallbackLoc[0], fallbackLoc[1])
        try {
          localStorage.setItem('yuno_cached_user_location', JSON.stringify(fallbackLoc));
          localStorage.setItem('yuno_last_fetch_time', String(Date.now()));
        } catch (e) {}
      }, 8000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          const { latitude, longitude } = position.coords
          console.log('📍 Location obtained:', { latitude, longitude })
          const currentLoc: [number, number] = [latitude, longitude];
          setUserLocation(currentLoc)
          setLoading(false)
          fetchAndCachePins(latitude, longitude)
          try {
            localStorage.setItem('yuno_cached_user_location', JSON.stringify(currentLoc));
            localStorage.setItem('yuno_last_fetch_time', String(Date.now()));
          } catch (e) {}
        },
        (geoError) => {
          clearTimeout(timeoutId)
          console.error('❌ Geolocation error:', geoError)
          setError('Location access denied. Using default location (Bhopal, India).')
          const fallbackLoc: [number, number] = [23.2257, 77.3867];
          setUserLocation(fallbackLoc)
          setLoading(false)
          fetchAndCachePins(fallbackLoc[0], fallbackLoc[1])
          try {
            localStorage.setItem('yuno_cached_user_location', JSON.stringify(fallbackLoc));
            localStorage.setItem('yuno_last_fetch_time', String(Date.now()));
          } catch (e) {}
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 0 }
      )
    } else {
      setError('Geolocation not supported.')
      const fallbackLoc: [number, number] = [23.2257, 77.3867];
      setUserLocation(fallbackLoc)
      setLoading(false)
      fetchAndCachePins(fallbackLoc[0], fallbackLoc[1])
      try {
        localStorage.setItem('yuno_cached_user_location', JSON.stringify(fallbackLoc));
        localStorage.setItem('yuno_last_fetch_time', String(Date.now()));
      } catch (e) {}
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

        const parsedLat = latParam ? parseFloat(latParam) : null
        const parsedLng = lngParam ? parseFloat(lngParam) : null
        const hasQuest = parsedLat !== null && !isNaN(parsedLat) && parsedLng !== null && !isNaN(parsedLng)

        const centerCoords: [number, number] = hasQuest 
          ? [parsedLat!, parsedLng!] 
          : userLocation

        // Create map with the container directly
        const map = L.map(mapContainerRef.current!, {
          center: centerCoords,
          zoom: hasQuest ? 15 : 13,
          scrollWheelZoom: true
        })

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map)

        // Drop the Quest landmark target marker if specified
        if (hasQuest && questName) {
          const questIcon = L.divIcon({
            className: 'quest-marker',
            html: `
              <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
                <div style="
                  position: absolute;
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  background: #D4453A;
                  border: 2.5px solid #FDFAF6;
                  box-shadow: 0 4px 12px rgba(212,69,58,0.55);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  animation: bounce 0.8s ease-in-out infinite alternate;
                ">🎯</div>
              </div>
            `,
            iconSize: [42, 42],
            iconAnchor: [21, 21]
          })
          L.marker(centerCoords, { icon: questIcon })
            .addTo(map)
            .bindPopup(`<b style="font-family: serif; color: #1E1616; font-size: 14px;">Active Quest</b><br/><span style="font-family: sans-serif; font-size: 12px; color: #8B7E74;">${questName}</span>`)
            .openPopup()
        }

        // Create avatar marker icon with initial inside and name label
        const createAvatarMarker = (color: string, name: string) => {
          const initial = name ? name.charAt(0).toUpperCase() : '?';
          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="position: relative; width: 36px; height: 36px;">
                <div style="
                  background: ${color}; 
                  width: 36px; 
                  height: 36px; 
                  border-radius: 50%; 
                  border: 2px solid #FFFFFF; 
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 16px;
                  font-family: Inter, sans-serif;
                  z-index: 10;
                ">${initial}</div>
                <div style="
                  position: absolute;
                  top: 40px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(255, 255, 255, 0.95);
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 700;
                  color: #3E2723;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                  white-space: nowrap;
                  z-index: 5;
                ">${name}</div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          })
        }

        // Add radius circles for discovery ranges
        const radiusColors = {
          5: '#5D4037',    // Primary brown
          10: '#D4453A',   // Accent leather
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
        L.marker(userLocation, { icon: createAvatarMarker('#5D4037', 'You') })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 12px; font-family: Inter, sans-serif;">
              <strong style="color: #1A0F0A; display: block; margin-bottom: 4px;">My Location</strong>
              <span style="color: #795548; font-size: 11px;">Discovery active within 20km</span>
            </div>
          `)

        // Add nearby user markers
        users.forEach(user => {
          L.marker([user.lat, user.lng], { icon: createAvatarMarker('#D4453A', user.name) })
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

        // NOTE: City Pulse event pins are added in the useEffect below
        // that watches [mapInstance, eventPins] to avoid stale closure issues.

        // Add legend to explain radius circles
        const LegendControl = L.Control.extend({
          onAdd: function() {
            const div = L.DomUtil.create('div', 'info legend')
            div.style.backgroundColor = 'white'
            div.style.padding = '10px'
            div.style.border = '2px solid #D4453A'
            div.style.borderRadius = '8px'
            div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            div.style.fontSize = '12px'
            div.style.fontFamily = 'Inter, sans-serif'
            
            div.innerHTML = `
              <h4 style="margin: 0 0 10px 0; color: #1A0F0A; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Map Legend</h4>
              <div style="display: flex; align-items: center; margin-bottom: 7px;">
                <div style="width: 10px; height: 10px; background: #f97316; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 2px rgba(249,115,22,0.3);"></div>
                <span style="color: #3E2723; font-size: 11px; font-weight: 500;">City Pulse Events</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 7px;">
                <div style="width: 10px; height: 10px; background: #5D4037; border-radius: 2px; margin-right: 8px; border: 1px solid white;"></div>
                <span style="color: #3E2723; font-size: 11px; font-weight: 500;">Landmarks &amp; Places</span>
              </div>
              <div style="border-top: 1px solid #EDE7E0; margin: 8px 0;"></div>
              <div style="display: flex; align-items: center; margin-bottom: 7px;">
                <div style="width: 10px; height: 10px; background: #5D4037; border-radius: 50%; margin-right: 8px; border: 1px solid white;"></div>
                <span style="color: #3E2723; font-size: 11px;">Inner Circle (5km)</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 7px;">
                <div style="width: 10px; height: 10px; background: #D4453A; border-radius: 50%; margin-right: 8px; border: 1px solid white;"></div>
                <span style="color: #3E2723; font-size: 11px;">Middle (10km)</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 10px; height: 10px; background: #C6B8AF; border-radius: 50%; margin-right: 8px; border: 1px solid white;"></div>
                <span style="color: #3E2723; font-size: 11px;">Extended (20km)</span>
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

  // ── City Pulse: render event pins whenever they load / change ────────────
  // This runs AFTER map init (mapInstance is set) and after pins arrive async.
  // Using a layer group so we can cleanly replace pins on future updates.
  useEffect(() => {
    if (!mapInstance || !eventPins.length) return

    let pinLayerGroup: any = null

    const addPins = async () => {
      const L = (await import('leaflet')).default

      // Remove previous pin layer if it exists
      if ((mapInstance as any)._cityPulseLayer) {
        (mapInstance as any)._cityPulseLayer.clearLayers()
      } else {
        pinLayerGroup = L.layerGroup().addTo(mapInstance)
        ;(mapInstance as any)._cityPulseLayer = pinLayerGroup
      }

      const layer = (mapInstance as any)._cityPulseLayer

      eventPins.forEach(pin => {
        const eventIcon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:18px;height:18px;">
              <div style="
                width:18px;height:18px;border-radius:50%;
                background:#f97316;border:2px solid #fff;
                box-shadow:0 0 0 0 rgba(249,115,22,0.6);
                animation:cityPulsePing 1.8s ease-out infinite;
              "></div>
            </div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -12],
        })

        L.marker([pin.latitude, pin.longitude], { icon: eventIcon })
          .addTo(layer)
          .bindPopup(`
            <div style="padding:12px;min-width:210px;font-family:Inter,sans-serif;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <span style="background:#fff7ed;color:#c2410c;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;">${pin.category}</span>
                <span style="color:#9ca3af;font-size:10px;">${pin.vibe}</span>
              </div>
              <strong style="color:#111827;font-size:13px;display:block;margin-bottom:4px;">${pin.title}</strong>
              <p style="color:#6b7280;font-size:11px;margin:0 0 8px;line-height:1.5;">${pin.description}</p>
              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid #f3f4f6;">
                <span style="color:#9ca3af;font-size:10px;">${pin.subreddit ? 'r/' + pin.subreddit : ''} · ↑${pin.reddit_score}</span>
                ${pin.source_url ? `<a href="${pin.source_url}" target="_blank" style="color:#f97316;font-size:10px;font-weight:600;text-decoration:none;">View post →</a>` : ''}
              </div>
            </div>
          `)
      })

      console.log(`🟠 City Pulse: ${eventPins.length} event pins rendered on map`)
    }

    addPins()
  }, [mapInstance, eventPins])

  // ── Landmark / POI pins (from Overpass / OSM) ────────────────────────────
  useEffect(() => {
    if (!mapInstance || !placePins.length) return

    const addPlaces = async () => {
      const L = (await import('leaflet')).default

      if ((mapInstance as any)._placesLayer) {
        (mapInstance as any)._placesLayer.clearLayers()
      } else {
        const placesLayer = L.layerGroup().addTo(mapInstance)
        ;(mapInstance as any)._placesLayer = placesLayer
      }

      const layer = (mapInstance as any)._placesLayer

      placePins.forEach(place => {
        // Diamond-shaped landmark marker in the brand brown
        const placeIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 22px; height: 22px;
              background: #5D4037;
              border: 2.5px solid #fff;
              border-radius: 4px 4px 0 4px;
              transform: rotate(45deg);
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              position: relative;
            "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 20],
          popupAnchor: [0, -22],
        })

        const categoryLabel = place.category
          .split(' ')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        L.marker([place.latitude, place.longitude], { icon: placeIcon })
          .addTo(layer)
          .bindPopup(`
            <div style="padding:10px;min-width:190px;font-family:Inter,sans-serif;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <span style="background:#F5F2EE;color:#5D4037;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;text-transform:capitalize;">${categoryLabel}</span>
              </div>
              <strong style="color:#1A0F0A;font-size:13px;display:block;margin-bottom:4px;">${place.name}</strong>
              ${place.description ? `<p style="color:#795548;font-size:11px;margin:0 0 8px;line-height:1.5;">${place.description.substring(0, 100)}${place.description.length > 100 ? '…' : ''}</p>` : ''}
              ${place.website ? `<a href="${place.website}" target="_blank" style="color:#D4453A;font-size:10px;font-weight:600;text-decoration:none;">Visit website →</a>` : ''}
            </div>
          `)
      })

      console.log(`🗺️ Places: ${placePins.length} landmark pins rendered on map`)
    }

    addPlaces()
  }, [mapInstance, placePins])

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