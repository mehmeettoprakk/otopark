'use client'

import { useState, useEffect } from 'react'
import DynamicMap from '@/components/Map/DynamicMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useParkingLots } from '@/hooks/useFirebase'
import { ParkingLot, MapLocation } from '@/types/parking'
import { calculateOccupancyPercentage, calculateDistance } from '@/lib/utils'
import { MapPin, Clock, Car, TrendingUp, Navigation, X } from 'lucide-react'

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
  const [focusLocation, setFocusLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // Google Maps yönlendirme fonksiyonu
  const openGoogleMapsDirection = (lat: number, lng: number) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(googleMapsUrl, '_blank')
  }

  // Otopark kartına tıklama fonksiyonu
  const handleParkingLotClick = (lot: ParkingLot) => {
    setSelectedLot(lot)
    setFocusLocation({ latitude: lot.latitude, longitude: lot.longitude })
  }

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
    if (percentage >= 90) return 'text-red-700 font-semibold'
    if (percentage >= 70) return 'text-amber-700 font-semibold'
    return 'text-emerald-700 font-semibold'
  }

  const getOccupancyBadgeColor = (occupied: number, total: number) => {
    const percentage = calculateOccupancyPercentage(occupied, total)
    if (percentage >= 90) return 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
    if (percentage >= 70) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
    return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
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
      {/* Modern Header - Mobil Uyumlu */}
      <header className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <Car className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white bg-gradient-to-r from-white to-indigo-100 bg-clip-text">
                  Otopark Takip
                </h1>
                <p className="text-white/80 text-xs sm:text-sm font-medium hidden sm:block">
                  Gerçek zamanlı otopark doluluk takibi
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/10 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">Canlı</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Harita */}
          <div>
            <Card className="card-elevated overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                <div className="space-y-3">
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-3 shadow-sm">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-xl">Otopark Haritası</div>
                      <div className="text-base font-normal text-slate-600">{parkingLots.length} otopark</div>
                    </div>
                  </CardTitle>
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
                        <span className="text-slate-700 text-base font-medium">Müsait</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-amber-500 rounded-full shadow-sm"></div>
                        <span className="text-slate-700 text-base font-medium">Dolmakta</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                        <span className="text-slate-700 text-base font-medium">Dolu</span>
                      </div>
                    </div>
                    {userLocation && (
                      <Button
                        onClick={() => setFocusLocation({ latitude: userLocation.latitude, longitude: userLocation.longitude })}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-xl font-medium text-base hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <span>Konumuma Git</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <DynamicMap
                  center={userLocation || DEFAULT_CENTER}
                  parkingLots={parkingLots}
                  userLocation={userLocation || undefined}
                  onParkingLotClick={handleParkingLotClick}
                  focusLocation={focusLocation}
                  height="large"
                />
              </CardContent>
            </Card>
          </div>

          {/* Otopark Listesi */}
          <div className="space-y-8">
            <Card className="card-elevated">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                <CardTitle className="flex items-center justify-between text-slate-800">
                  <span className="flex items-center">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mr-3 shadow-sm">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Otoparklar ({parkingLots.length})</span>
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'distance' | 'occupancy')}
                    className="text-base border border-slate-300 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="distance">Mesafeye göre</option>
                    <option value="occupancy">Doluluk oranına göre</option>
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 max-h-[500px] sm:max-h-[600px] lg:max-h-[900px] overflow-y-auto p-4 sm:p-6 lg:p-10">
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
                      className={`group relative bg-white rounded-3xl shadow-lg border border-slate-200 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
                        selectedLot?.id === lot.id 
                          ? 'ring-4 ring-indigo-500/30 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 shadow-2xl scale-[1.02]' 
                          : 'hover:border-indigo-300'
                      }`}
                      onClick={() => handleParkingLotClick(lot)}
                    >
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl pointer-events-none"></div>
                      
                      <div className="relative p-6 sm:p-8 lg:p-10">
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-lg sm:text-xl leading-tight mb-2">{lot.name}</h3>
                            <p className="text-slate-600 text-sm sm:text-base font-medium">{lot.address}</p>
                          </div>
                          <span className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold ${getOccupancyBadgeColor(lot.occupiedSpaces, lot.totalSpaces)}`}>
                            %{occupancyPercentage}
                          </span>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl">
                                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium">Boş Yer</p>
                                <p className={`text-base sm:text-xl font-bold ${getOccupancyColor(lot.occupiedSpaces, lot.totalSpaces)}`}>
                                  {availableSpaces}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium">Saat/Ücret</p>
                                <p className="text-base sm:text-xl font-bold text-slate-900">{lot.hourlyRate}₺</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Distance */}
                        {distance && (
                          <div className="flex items-center justify-center bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl sm:rounded-2xl py-2 sm:py-3 px-4 sm:px-5 border border-slate-100">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-slate-500" />
                            <span className="text-sm sm:text-base font-semibold text-slate-700">{distance.toFixed(1)} km uzaklıkta</span>
                          </div>
                        )}
                        
                        {/* Seçili otopark için ek detaylar ve yönlendirme */}
                        {selectedLot?.id === lot.id && (
                          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-indigo-200">
                            {/* Yönlendirme butonu */}
                            <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openGoogleMapsDirection(lot.latitude, lot.longitude)
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center space-x-2 sm:space-x-3"
                              >
                                <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Yol Tarifi Al</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLot(null)
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                              >
                                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                            
                            {/* Ek bilgiler */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-200">
                              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                                <div>
                                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{lot.totalSpaces}</p>
                                  <p className="text-sm sm:text-base text-slate-600 font-medium">Toplam</p>
                                </div>
                                <div>
                                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{lot.totalSpaces - lot.occupiedSpaces}</p>
                                  <p className="text-sm sm:text-base text-slate-600 font-medium">Boş</p>
                                </div>
                              </div>
                              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-indigo-200 text-center">
                                <p className="text-sm sm:text-base text-indigo-700 font-semibold">
                                  Gerçek zamanlı park durumu
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Status indicator */}
                        <div className={`absolute top-6 left-6 w-4 h-4 rounded-full shadow-md ${
                          occupancyPercentage >= 90 ? 'bg-red-500' :
                          occupancyPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  )
}
