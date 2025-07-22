'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapLocation, ParkingLot, ParkingStatus } from '@/types/parking'
import { calculateOccupancyPercentage } from '@/lib/utils'

// Leaflet marker icon sorunu için fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LeafletMapProps {
  center: MapLocation
  parkingLots: ParkingLot[]
  onParkingLotClick?: (lot: ParkingLot) => void
  userLocation?: MapLocation
  height?: string
  focusLocation?: { latitude: number; longitude: number } | null
}

// Durum bazlı renk ve emoji
const getStatusStyle = (status: ParkingStatus, occupancy: number) => {
  switch (status) {
    case ParkingStatus.AVAILABLE:
      if (occupancy < 50) return { color: '#10b981', bg: '#d1fae5', emoji: '🟢', text: 'Müsait' }
      if (occupancy < 80) return { color: '#f97316', bg: '#fed7aa', emoji: '🟡', text: 'Az Yer' }
      return { color: '#ef4444', bg: '#fee2e2', emoji: '🔴', text: 'Neredeyse Dolu' }
    case ParkingStatus.NEARLY_FULL:
      return { color: '#f97316', bg: '#fed7aa', emoji: '🟡', text: 'Az Yer' }
    case ParkingStatus.OCCUPIED:
      return { color: '#ef4444', bg: '#fee2e2', emoji: '🔴', text: 'Dolu' }
    case ParkingStatus.MAINTENANCE:
      return { color: '#8b5cf6', bg: '#e9d5ff', emoji: '🔧', text: 'Bakımda' }
    case ParkingStatus.CLOSED:
      return { color: '#6b7280', bg: '#f3f4f6', emoji: '🚫', text: 'Kapalı' }
    case ParkingStatus.RESERVED:
      return { color: '#3b82f6', bg: '#dbeafe', emoji: '🅿️', text: 'Rezerve' }
    default:
      return { color: '#10b981', bg: '#d1fae5', emoji: '🟢', text: 'Müsait' }
  }
}

export default function LeafletMap({ 
  center, 
  parkingLots, 
  onParkingLotClick, 
  userLocation,
  height = '100%',
  focusLocation
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(
      [center.latitude, center.longitude],
      center.zoom || 13
    )

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        // Clean up user marker
        if (userMarkerRef.current) {
          mapRef.current.removeLayer(userMarkerRef.current)
          userMarkerRef.current = null
        }
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Sadece mount'ta çalışır - center değişiklikleri focusLocation effect'i ile yönetilir

  // Focus location effect
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return

    // Önceki timeout'u temizle
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Yeni animasyonu debounce ile başlat
    animationTimeoutRef.current = setTimeout(() => {
      if (mapRef.current && focusLocation) {
        mapRef.current.flyTo([focusLocation.latitude, focusLocation.longitude], 16, {
          duration: 1.5
        })
      }
    }, 50) // 50ms debounce - daha hızlı

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [focusLocation])

  // Add parking lot markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    parkingLots.forEach((lot) => {
      const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
      const statusStyle = getStatusStyle(lot.status, occupancyPercentage)

      const marker = L.marker([lot.latitude, lot.longitude], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              position: relative; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              width: 80px;
              height: 100px;
            ">
              <div style="
                position: relative;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, ${statusStyle.color}ee, ${statusStyle.color});
                border-radius: 50% 50% 50% 0;
                border: 4px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(-45deg);
                margin-bottom: 8px;
              ">
                <div style="
                  transform: rotate(45deg);
                  font-size: 24px;
                  line-height: 1;
                ">
                  ${statusStyle.emoji}
                </div>
              </div>
              
              <div style="
                background: white;
                padding: 4px 8px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                border: 2px solid ${statusStyle.color};
                font-size: 11px;
                font-weight: bold;
                color: ${statusStyle.color};
                white-space: nowrap;
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
              ">
                ${lot.totalSpaces - lot.occupiedSpaces}/${lot.totalSpaces}
              </div>
            </div>
          `,
          iconSize: [80, 100],
          iconAnchor: [40, 90]
        })
      }).addTo(mapRef.current!)

      // Click event - modal açmak için
      if (onParkingLotClick) {
        marker.on('click', () => onParkingLotClick(lot))
      }

      markersRef.current.push(marker)
    })
  }, [parkingLots, onParkingLotClick])

  // Add/Update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    // If marker doesn't exist, create it
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.divIcon({
          className: 'user-location-icon',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: #3b82f6;
              border: 4px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              position: relative;
              z-index: 1000;
            ">
              <div style="
                position: absolute;
                top: -12px;
                left: -12px;
                width: 48px;
                height: 48px;
                border: 3px solid #3b82f6;
                border-radius: 50%;
                animation: pulse 2s infinite;
                opacity: 0.4;
              "></div>
              <div style="
                position: absolute;
                top: -6px;
                left: -6px;
                width: 36px;
                height: 36px;
                border: 2px solid #60a5fa;
                border-radius: 50%;
                animation: pulse 2s infinite 0.5s;
                opacity: 0.6;
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(mapRef.current)

      // Add pulse animation only once
      if (!document.getElementById('user-location-pulse-style')) {
        const style = document.createElement('style')
        style.id = 'user-location-pulse-style'
        style.textContent = `
          @keyframes pulse {
            0% {
              transform: scale(0.8);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `
        document.head.appendChild(style)
      }
    } else {
      // If marker exists, just update position
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude])
    }

  }, [userLocation])

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: height === 'responsive' ? undefined : height === '100%' ? '100%' : height
      }}
      className={`w-full z-0 ${
        height === 'responsive' 
          ? 'h-[300px] sm:h-[400px] lg:h-[650px]' 
          : height === 'large'
          ? 'h-[400px] sm:h-[500px] lg:h-[800px]'
          : height === '100%'
          ? 'h-full'
          : ''
      }`}
    />
  )
}
