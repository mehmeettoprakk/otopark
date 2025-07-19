'use client'

import dynamic from 'next/dynamic'
import { MapLocation, ParkingLot } from '@/types/parking'

interface DynamicMapProps {
  center: MapLocation
  parkingLots: ParkingLot[]
  onParkingLotClick?: (lot: ParkingLot) => void
  userLocation?: MapLocation
  height?: string
  focusLocation?: { latitude: number; longitude: number } | null
}

const Map = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-pulse rounded-2xl flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-purple-200/30 to-pink-200/30 animate-pulse"></div>
      <div className="relative z-10 text-center">
        <div className="mb-4 text-4xl animate-bounce">🗺️</div>
        <div className="text-gray-700 font-semibold text-lg">Harita yükleniyor...</div>
        <div className="text-gray-500 text-sm mt-2">Lütfen bekleyin</div>
      </div>
    </div>
  )
})

export default function DynamicMap(props: DynamicMapProps) {
  return <Map {...props} />
} 