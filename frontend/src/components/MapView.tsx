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
          // If fetched within 30 minutes, reuse location and cached pins without refetching
          if (timePassed < 30 * 60 * 1000) {
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
              <div style="position: relative; width: 44px; height: 44px;">
                <div style="
                  background: ${color}; 
                  background-image: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 100%);
                  width: 40px; 
                  height: 40px; 
                  border-radius: 50%; 
                  border: 3px solid #FFFFFF; 
                  box-shadow: 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -4px 4px rgba(0,0,0,0.2);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 18px;
                  font-family: Inter, sans-serif;
                  z-index: 10;
                  transform: perspective(100px) rotateX(10deg);
                ">${initial}</div>
                <div style="
                  position: absolute;
                  top: 48px;
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
            iconSize: [44, 44],
            iconAnchor: [22, 22],
            popupAnchor: [0, -22]
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
              <h4 style="margin: 0 0 10px 0; color: #1A0F0A; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;">Map Legend</h4>
              
              <div style="display: grid; grid-template-columns: 1fr; gap: 4px; font-size: 10px;">
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <div style="width: 12px; height: 12px; background: linear-gradient(135deg, #f97316 0%, #c2410c 100%); border-radius: 50%; margin-right: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.15);"></div>
                  <span style="color: #3E2723; font-weight: 600;">City Pulse Events</span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <span style="font-size: 12px; margin-right: 6px;">🛕</span>
                  <span style="color: #3E2723;">Temples & Worship</span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <span style="font-size: 12px; margin-right: 6px;">🛍️</span>
                  <span style="color: #3E2723;">Malls & Shopping</span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <span style="font-size: 12px; margin-right: 6px;">☕</span>
                  <span style="color: #3E2723;">Cafes & Dining</span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <span style="font-size: 12px; margin-right: 6px;">🌳</span>
                  <span style="color: #3E2723;">Parks & Nature</span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <span style="font-size: 12px; margin-right: 6px;">🏛️</span>
                  <span style="color: #3E2723;">Historic & Museum</span>
                </div>

                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <span style="font-size: 12px; margin-right: 6px;">🏫</span>
                  <span style="color: #3E2723;">Schools & Colleges</span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <span style="font-size: 12px; margin-right: 6px;">📍</span>
                  <span style="color: #3E2723;">Other Places</span>
                </div>
              </div>

              <div style="border-top: 1px solid #EDE7E0; margin: 6px 0;"></div>
              
              <div style="display: flex; flex-direction: column; gap: 3px; font-size: 9px; color: #5D4037;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 8px; height: 8px; background: #5D4037; border-radius: 50%; margin-right: 6px; opacity: 0.6;"></div>
                  <span>Inner Circle (5km)</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 8px; height: 8px; background: #D4453A; border-radius: 50%; margin-right: 6px; opacity: 0.6;"></div>
                  <span>Middle (10km)</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 8px; height: 8px; background: #C6B8AF; border-radius: 50%; margin-right: 6px; opacity: 0.6;"></div>
                  <span>Extended (20km)</span>
                </div>
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
            <div style="position:relative;width:40px;height:40px;display:flex;flex-direction:column;align-items:center;">
              <div style="
                width:24px;height:24px;border-radius:50%;
                background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
                border: 2.5px solid #fff;
                box-shadow: 0 6px 12px rgba(194,65,12,0.4), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -3px 4px rgba(0,0,0,0.2);
                animation:cityPulsePing 1.8s ease-out infinite;
                transform: perspective(100px) rotateX(10deg);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
              ">
                <span style="width: 8px; height: 8px; background: white; border-radius: 50%; display: block; box-shadow: inset 0 -1px 2px rgba(0,0,0,0.3);"></span>
              </div>
              <div style="
                margin-top: 6px;
                background: rgba(255, 255, 255, 0.95);
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
                color: #c2410c;
                box-shadow: 0 3px 8px rgba(0,0,0,0.15);
                white-space: nowrap;
                z-index: 5;
                font-family: Inter, sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              ">${pin.category}</div>
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
        const getPlaceMarkerDetails = (name: string, category: string) => {
          const n = name.toLowerCase();
          const c = category.toLowerCase();
          
          if (c.includes('worship') || c.includes('temple') || n.includes('temple') || n.includes('mandir') || n.includes('ashram') || n.includes('math')) {
            return { emoji: '🛕', color: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', label: 'Temple / Worship' };
          }
          if (c.includes('mosque') || n.includes('mosque') || n.includes('masjid')) {
            return { emoji: '🕌', color: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', label: 'Mosque / Worship' };
          }
          if (c.includes('church') || n.includes('church') || n.includes('cathedral')) {
            return { emoji: '⛪', color: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', label: 'Church / Worship' };
          }
          if (c.includes('mall') || c.includes('shop') || n.includes('mall') || n.includes('shopping') || n.includes('mart') || n.includes('bazaar') || c.includes('retail')) {
            return { emoji: '🛍️', color: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)', label: 'Mall / Shopping' };
          }
          if (c.includes('cafe') || c.includes('restaurant') || c.includes('food') || n.includes('cafe') || n.includes('restaurant') || n.includes('hotel') || n.includes('dhaba') || n.includes('bistro') || n.includes('sweet') || c.includes('bar') || c.includes('pub')) {
            return { emoji: '☕', color: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)', label: 'Cafe / Dining' };
          }
          if (c.includes('park') || c.includes('garden') || c.includes('forest') || n.includes('park') || n.includes('garden') || n.includes('lake') || n.includes('talab') || c.includes('leisure')) {
            return { emoji: '🌳', color: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)', label: 'Park / Nature' };
          }
          if (c.includes('museum') || c.includes('monument') || c.includes('attraction') || n.includes('museum') || n.includes('fort') || n.includes('palace') || n.includes('monument') || n.includes('statue') || c.includes('historic') || c.includes('tourism')) {
            return { emoji: '🏛️', color: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', label: 'Attraction / Historic' };
          }
          if (c.includes('college') || c.includes('university') || c.includes('school') || n.includes('college') || n.includes('university') || n.includes('school') || n.includes('institute') || c.includes('education')) {
            return { emoji: '🏫', color: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)', label: 'Education' };
          }
          if (c.includes('hospital') || c.includes('health') || n.includes('hospital') || n.includes('clinic') || c.includes('medical')) {
            return { emoji: '🏥', color: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', label: 'Medical' };
          }
          // Generic 3D Pin
          return { emoji: '📍', color: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)', label: 'Location' };
        };

        const details = getPlaceMarkerDetails(place.name, place.category);

        // 3D Teardrop Pin with Upright Categorized Emoji
        const placeIcon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center; width:80px;">
              <div style="
                width: 36px;
                height: 36px;
                background: ${details.color};
                border: 2px solid #FFFFFF;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg) perspective(100px) rotateX(15deg);
                box-shadow: -4px 6px 12px rgba(0,0,0,0.35), inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
              ">
                <span style="
                  transform: rotate(45deg);
                  font-size: 18px;
                  line-height: 1;
                  display: block;
                ">${details.emoji}</span>
              </div>
              <div style="
                margin-top: 8px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #EDE7E0;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
                color: #1E1616;
                box-shadow: 0 4px 10px rgba(0,0,0,0.12);
                white-space: nowrap;
                z-index: 5;
                font-family: Inter, sans-serif;
              ">${place.name.substring(0, 15)}${place.name.length > 15 ? '...' : ''}</div>
            </div>`,
          iconSize: [80, 64],
          iconAnchor: [40, 36],
          popupAnchor: [0, -36]
        })

        L.marker([place.latitude, place.longitude], { icon: placeIcon })
          .addTo(layer)
          .bindPopup(`
            <div style="padding:10px;min-width:190px;font-family:Inter,sans-serif;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <span style="background:#F5F2EE;color:#5D4037;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;text-transform:capitalize;">${details.label}</span>
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