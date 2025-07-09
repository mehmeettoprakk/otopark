'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapLocation, ParkingLot } from '@/types/parking'
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

export default function LeafletMap({ 
  center, 
  parkingLots, 
  onParkingLotClick, 
  userLocation,
  height = '400px',
  focusLocation
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Haritayı initialize et
    mapRef.current = L.map(mapContainerRef.current).setView(
      [center.latitude, center.longitude],
      center.zoom || 13
    )

    // Tile layer ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center])

  // Odaklanma efekti - otopark kartına tıklandığında çalışır
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return

    // Haritayı seçilen otoparka odakla - smooth animasyon ile
    mapRef.current.flyTo([focusLocation.latitude, focusLocation.longitude], 16, {
      duration: 1.5, // 1.5 saniye animasyon
      easeLinearity: 0.25
    })
  }, [focusLocation])

  useEffect(() => {
    if (!mapRef.current) return

    // Önceki marker'ları temizle
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Kullanıcı konumu marker'ı
    if (userLocation) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="
              width: 16px; 
              height: 16px; 
              background-color: #3b82f6; 
              border-radius: 50%; 
              border: 2px solid white; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(mapRef.current!)
      
      markersRef.current.push(userMarker)
    }

    // Otopark marker'ları
    parkingLots.forEach(lot => {
      const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
      const isAlmostFull = occupancyPercentage >= 90
      const isFull = occupancyPercentage >= 100
      
      let backgroundColor = '#10b981' // emerald-500
      if (isFull) backgroundColor = '#ef4444' // red-500
      else if (isAlmostFull) backgroundColor = '#f59e0b' // amber-500

      const marker = L.marker([lot.latitude, lot.longitude], {
        icon: L.divIcon({
          className: 'parking-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="
                width: 32px; 
                height: 32px; 
                background-color: ${backgroundColor}; 
                border-radius: 50%; 
                border: 2px solid white; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-size: 12px; 
                font-weight: bold;
                font-family: system-ui, -apple-system, sans-serif;
              ">
                P
              </div>
              <div style="
                background-color: white; 
                padding: 4px 8px; 
                border-radius: 6px; 
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                font-size: 11px; 
                font-weight: 500; 
                margin-top: 4px; 
                white-space: nowrap;
                color: #374151;
                font-family: system-ui, -apple-system, sans-serif;
                border: 1px solid #e5e7eb;
              ">
                ${lot.totalSpaces - lot.occupiedSpaces}/${lot.totalSpaces}
              </div>
            </div>
          `,
          iconSize: [60, 60],
          iconAnchor: [30, 45]
        })
      }).addTo(mapRef.current!)

      // Popup ekle
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${lot.name}</h3>
          <p class="text-gray-600 text-sm">${lot.address}</p>
          <div class="mt-2">
            <p class="text-sm"><strong>Doluluk:</strong> ${lot.occupiedSpaces}/${lot.totalSpaces} (%${occupancyPercentage})</p>
            <p class="text-sm"><strong>Saatlik Ücret:</strong> ${lot.hourlyRate} ₺</p>
          </div>
        </div>
      `)

      // Click event
      if (onParkingLotClick) {
        marker.on('click', () => onParkingLotClick(lot))
      }

      markersRef.current.push(marker)
    })
  }, [parkingLots, userLocation, onParkingLotClick])

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: height === 'responsive' ? undefined : height
      }}
      className={`w-full rounded-lg shadow-lg z-0 ${
        height === 'responsive' 
          ? 'h-[300px] sm:h-[400px] lg:h-[650px]' 
          : ''
      }`}
    />
  )
} 