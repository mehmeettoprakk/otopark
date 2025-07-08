'use client'

import { useState, useEffect } from 'react'
import DynamicMap from '@/components/Map/DynamicMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useParkingLots } from '@/hooks/useFirebase'
import { ParkingLot, MapLocation } from '@/types/parking'
import { calculateOccupancyPercentage, calculateDistance } from '@/lib/utils'
import { MapPin, Clock, Car, TrendingUp } from 'lucide-react'

// Varsayılan konum (İstanbul merkezi)
const DEFAULT_CENTER: MapLocation = {
  latitude: 41.0082,
  longitude: 28.9784,
  zoom: 11
}

export default function HomePage() {
  const { parkingLots, loading, error } = useParkingLots()
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null)
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
  const [sortBy, setSortBy] = useState<'distance' | 'occupancy'>('distance')

  // Kullanıcı konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Konum alınamadı:', error)
        }
      )
    }
  }, [])

  // Otoparkları sırala
  const sortedParkingLots = [...parkingLots].sort((a, b) => {
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
    } else if (sortBy === 'occupancy') {
      const occupancyA = calculateOccupancyPercentage(a.occupiedSpaces, a.totalSpaces)
      const occupancyB = calculateOccupancyPercentage(b.occupiedSpaces, b.totalSpaces)
      return occupancyA - occupancyB
    }
    return 0
  })

  const getOccupancyColor = (occupied: number, total: number) => {
    const percentage = calculateOccupancyPercentage(occupied, total)
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getOccupancyBadgeColor = (occupied: number, total: number) => {
    const percentage = calculateOccupancyPercentage(occupied, total)
    if (percentage >= 90) return 'bg-red-100 text-red-800'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center glass p-8 rounded-2xl">
          <div className="loading-spinner h-16 w-16 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Otopark Bilgileri Yükleniyor</h2>
          <p className="text-white/80">Lütfen bekleyiniz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center max-w-md glass p-8 rounded-2xl">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-4">Bağlantı Hatası</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-sm text-amber-100">
              <strong>Firebase yapılandırması gerekli!</strong><br />
              .env.local dosyasında Firebase bilgilerinizi ekleyin.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-xl mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Otopark Takip Sistemi</h1>
                <p className="text-white/70 text-sm">Gerçek zamanlı otopark doluluk takibi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/admin'}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Harita */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Otopark Haritası
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicMap
                  center={userLocation || DEFAULT_CENTER}
                  parkingLots={parkingLots}
                  userLocation={userLocation || undefined}
                  onParkingLotClick={setSelectedLot}
                  height="500px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Otopark Listesi */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Otoparklar ({parkingLots.length})
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'distance' | 'occupancy')}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="distance">Mesafeye göre</option>
                    <option value="occupancy">Doluluk oranına göre</option>
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {sortedParkingLots.map((lot) => {
                  const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
                  const availableSpaces = lot.totalSpaces - lot.occupiedSpaces
                  const distance = userLocation 
                    ? calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        lot.latitude,
                        lot.longitude
                      )
                    : null

                  return (
                    <div
                      key={lot.id}
                      className={`p-5 modern-card cursor-pointer transition-all duration-300 ${
                        selectedLot?.id === lot.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => setSelectedLot(lot)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{lot.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOccupancyBadgeColor(lot.occupiedSpaces, lot.totalSpaces)}`}>
                          %{occupancyPercentage}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{lot.address}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-1 text-gray-400" />
                          <span className={getOccupancyColor(lot.occupiedSpaces, lot.totalSpaces)}>
                            {availableSpaces} boş yer
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{lot.hourlyRate} ₺/saat</span>
                        </div>
                        {distance && (
                          <div className="col-span-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{distance.toFixed(1)} km uzaklıkta</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Seçili Otopark Detayı */}
            {selectedLot && (
              <Card>
                <CardHeader>
                  <CardTitle>Detaylar</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{selectedLot.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedLot.address}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Toplam Park Yeri:</span>
                      <span className="font-medium">{selectedLot.totalSpaces}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dolu:</span>
                      <span className="font-medium text-red-600">{selectedLot.occupiedSpaces}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Boş:</span>
                      <span className="font-medium text-green-600">{selectedLot.totalSpaces - selectedLot.occupiedSpaces}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saatlik Ücret:</span>
                      <span className="font-medium">{selectedLot.hourlyRate} ₺</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
