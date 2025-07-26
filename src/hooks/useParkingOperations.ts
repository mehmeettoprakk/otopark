import { useMemo } from 'react'
import { ParkingLot, ParkingStatus, MapLocation } from '@/types/parking'
import { calculateDistance, calculateOccupancyPercentage } from '@/lib/utils'
import { GOOGLE_MAPS_URL } from '@/constants/app'

interface UseParkingOperationsParams {
  parkingLots: ParkingLot[]
  userLocation: MapLocation | null
  searchQuery: string
  statusFilter: ParkingStatus | 'all'
  sortBy: 'distance' | 'occupancy'
}

interface ParkingStatistics {
  total: number
  available: number
  nearlyFull: number
  occupied: number
  maintenance: number
  closed: number
  reserved: number
}

interface UseParkingOperationsReturn {
  filteredParkingLots: ParkingLot[]
  statistics: ParkingStatistics
  getDistance: (lot: ParkingLot) => number | null
  openGoogleMapsDirection: (lat: number, lng: number) => void
}

export function useParkingOperations({
  parkingLots,
  userLocation,
  searchQuery,
  statusFilter,
  sortBy
}: UseParkingOperationsParams): UseParkingOperationsReturn {

  const filteredParkingLots = useMemo(() => {
    return parkingLots
      .filter(lot => {
        const matchesSearch = lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             lot.address.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || lot.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'distance' && userLocation) {
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.latitude,
            a.longitude
          )
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.latitude,
            b.longitude
          )
          return distanceA - distanceB
        } else {
          // Doluluk oranına göre sırala ama kapalı otoparkları en sona koy
          const occupancyA = calculateOccupancyPercentage(a.occupiedSpaces, a.totalSpaces)
          const occupancyB = calculateOccupancyPercentage(b.occupiedSpaces, b.totalSpaces)
          
          // Kapalı durumları kontrol et
          const aIsClosed = a.status === ParkingStatus.CLOSED
          const bIsClosed = b.status === ParkingStatus.CLOSED
          
          // Kapalı olanlar en sona
          if (aIsClosed && !bIsClosed) return 1
          if (!aIsClosed && bIsClosed) return -1
          
          // İkisi de kapalı değilse veya ikisi de kapalıysa doluluk oranına göre sırala
          return occupancyA - occupancyB
        }
      })
  }, [parkingLots, searchQuery, statusFilter, sortBy, userLocation])

  const statistics = useMemo((): ParkingStatistics => ({
    total: parkingLots.length,
    available: parkingLots.filter(lot => lot.status === ParkingStatus.AVAILABLE).length,
    nearlyFull: parkingLots.filter(lot => lot.status === ParkingStatus.NEARLY_FULL).length,
    occupied: parkingLots.filter(lot => lot.status === ParkingStatus.OCCUPIED).length,
    maintenance: parkingLots.filter(lot => lot.status === ParkingStatus.MAINTENANCE).length,
    closed: parkingLots.filter(lot => lot.status === ParkingStatus.CLOSED).length,
    reserved: parkingLots.filter(lot => lot.status === ParkingStatus.RESERVED).length
  }), [parkingLots])

  const getDistance = (lot: ParkingLot): number | null => {
    if (!userLocation) return null
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      lot.latitude,
      lot.longitude
    )
  }

  const openGoogleMapsDirection = (lat: number, lng: number): void => {
    const googleMapsUrl = `${GOOGLE_MAPS_URL}${lat},${lng}`
    window.open(googleMapsUrl, '_blank')
  }

  return {
    filteredParkingLots,
    statistics,
    getDistance,
    openGoogleMapsDirection
  }
} 