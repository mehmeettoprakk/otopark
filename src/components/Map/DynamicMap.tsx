'use client'

import dynamic from 'next/dynamic'
import { MapLocation, ParkingLot } from '@/types/parking'

interface DynamicMapProps {
  center: MapLocation
  parkingLots: ParkingLot[]
  onParkingLotClick?: (lot: ParkingLot) => void
  userLocation?: MapLocation
  height?: string
}

const Map = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Harita yükleniyor...</div>
    </div>
  )
})

export default function DynamicMap(props: DynamicMapProps) {
  return <Map {...props} />
} 