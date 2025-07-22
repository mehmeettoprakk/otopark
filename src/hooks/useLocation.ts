import { useState, useEffect } from 'react'
import { MapLocation } from '@/types/parking'

interface UseLocationReturn {
  userLocation: MapLocation | null
  isLocationLoading: boolean
  locationError: string | null
  requestLocation: () => Promise<void>
}

export function useLocation(): UseLocationReturn {
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const requestLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setLocationError('Konum servisi bu tarayıcıda desteklenmiyor')
      return
    }

    setIsLocationLoading(true)
    setLocationError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      })

      const newLocation: MapLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        zoom: 13
      }

      setUserLocation(newLocation)
    } catch (error) {
      const geolocationError = error as GeolocationPositionError
      
      switch (geolocationError.code) {
        case geolocationError.PERMISSION_DENIED:
          setLocationError('Konum erişimi reddedildi')
          break
        case geolocationError.POSITION_UNAVAILABLE:
          setLocationError('Konum bilgisi alınamadı')
          break
        case geolocationError.TIMEOUT:
          setLocationError('Konum alma işlemi zaman aşımına uğradı')
          break
        default:
          setLocationError('Konum alınırken bilinmeyen bir hata oluştu')
      }
    } finally {
      setIsLocationLoading(false)
    }
  }

  // Auto-request location on mount
  useEffect(() => {
    requestLocation()
  }, [])

  return {
    userLocation,
    isLocationLoading,
    locationError,
    requestLocation
  }
} 