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
}

export default function LeafletMap({ 
  center, 
  parkingLots, 
  onParkingLotClick, 
  userLocation,
  height = '400px' 
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
          html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
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
      
      let markerColor = 'bg-green-500'
      if (isFull) markerColor = 'bg-red-500'
      else if (isAlmostFull) markerColor = 'bg-yellow-500'

      const marker = L.marker([lot.latitude, lot.longitude], {
        icon: L.divIcon({
          className: 'parking-marker',
          html: `
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 ${markerColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              <div class="bg-white px-2 py-1 rounded shadow-md text-xs font-medium mt-1 whitespace-nowrap">
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
      style={{ height }}
      className="w-full rounded-lg shadow-lg z-0"
    />
  )
} 