'use client'

import { useState, useEffect } from 'react'
import DynamicMap from '@/components/Map/DynamicMap'
import Button from '@/components/ui/Button'
import { useParkingLots } from '@/hooks/useFirebase'
import { ParkingLot, MapLocation, ParkingStatus } from '@/types/parking'
import { calculateOccupancyPercentage, calculateDistance } from '@/lib/utils'
import { MapPin, Clock, Car, TrendingUp, Navigation, X, Search, Zap, Settings, WrenchIcon } from 'lucide-react'

// Varsayılan konum (Türkiye merkezi)
const DEFAULT_CENTER: MapLocation = {
  latitude: 39.1667,
  longitude: 35.1667,
  zoom: 6
}

// Durum bazlı stil fonksiyonu
const getStatusStyle = (status: ParkingStatus, occupancy: number) => {
  switch (status) {
    case ParkingStatus.AVAILABLE:
      if (occupancy < 50) return { color: 'text-green-600', bg: 'bg-green-100', emoji: '🟢', text: 'Müsait', borderColor: 'border-green-300' }
      if (occupancy < 80) return { color: 'text-yellow-600', bg: 'bg-yellow-100', emoji: '🟡', text: 'Dolmak Üzere', borderColor: 'border-yellow-300' }
      return { color: 'text-red-600', bg: 'bg-red-100', emoji: '🔴', text: 'Neredeyse Dolu', borderColor: 'border-red-300' }
    case ParkingStatus.OCCUPIED:
      return { color: 'text-red-600', bg: 'bg-red-100', emoji: '🔴', text: 'Dolu', borderColor: 'border-red-300' }
    case ParkingStatus.MAINTENANCE:
      return { color: 'text-purple-600', bg: 'bg-purple-100', emoji: '🔧', text: 'Bakımda', borderColor: 'border-purple-300' }
    case ParkingStatus.CLOSED:
      return { color: 'text-gray-600', bg: 'bg-gray-100', emoji: '🚫', text: 'Kapalı', borderColor: 'border-gray-300' }
    case ParkingStatus.RESERVED:
      return { color: 'text-blue-600', bg: 'bg-blue-100', emoji: '🅿️', text: 'Rezerve', borderColor: 'border-blue-300' }
    default:
      return { color: 'text-green-600', bg: 'bg-green-100', emoji: '🟢', text: 'Müsait', borderColor: 'border-green-300' }
  }
}

// Loading Skeleton Component
const LoadingCard = () => (
  <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl p-4 animate-pulse shadow-lg">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-3/4"></div>
        <div className="h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-1/2"></div>
        <div className="flex space-x-2">
          <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-12"></div>
          <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  </div>
)

export default function HomePage() {
  const { parkingLots, loading, error } = useParkingLots()
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null)
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
  const [sortBy, setSortBy] = useState<'distance' | 'occupancy'>('distance')
  const [focusLocation, setFocusLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [statusFilter, setStatusFilter] = useState<ParkingStatus | 'all'>('all')

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
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Ana sayfa - Gerçek konum alındı:', { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude, 
            accuracy: position.coords.accuracy 
          })
          
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Ana sayfa - Konum alınamadı:', error)
        },
        options
      )
    }
  }, [])

  // Otoparkları filtrele ve sırala
  const filteredParkingLots = parkingLots
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
      const occupancyA = calculateOccupancyPercentage(a.occupiedSpaces, a.totalSpaces)
      const occupancyB = calculateOccupancyPercentage(b.occupiedSpaces, b.totalSpaces)
      return occupancyA - occupancyB
    }
    })

  // Mesafe hesaplama
  const getDistance = (lot: ParkingLot) => {
    if (!userLocation) return null
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      lot.latitude,
      lot.longitude
    )
  }

  // İstatistikler
  const stats = {
    total: parkingLots.length,
    available: parkingLots.filter(lot => lot.status === ParkingStatus.AVAILABLE).length,
    occupied: parkingLots.filter(lot => lot.status === ParkingStatus.OCCUPIED).length,
    maintenance: parkingLots.filter(lot => lot.status === ParkingStatus.MAINTENANCE).length,
    closed: parkingLots.filter(lot => lot.status === ParkingStatus.CLOSED).length,
    reserved: parkingLots.filter(lot => lot.status === ParkingStatus.RESERVED).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-header top-0 backdrop-blur-lg bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Otopark Takip
                </h1>
                <p className="text-xs text-gray-500">Gerçek zamanlı otopark doluluk takibi</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="hover:bg-white/50">
                Canlı
              </Button>
              <Button 
                variant="outline" 
                className="glass-button"
                onClick={() => window.location.href = '/admin'}
              >
                Admin Panel
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-800 mb-4 animate-fade-in">
              <Zap className="h-4 w-4" />
              <span>Gerçek Zamanlı Takip</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              En Yakın <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Otoparkları</span> Keşfedin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Akıllı algoritma ile size en uygun park yerini bulun. Gerçek zamanlı doluluk oranları ve mesafe bilgileri.
            </p>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 animate-fade-in-up animation-delay-300">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Toplam</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-gray-600">Müsait</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
              <div className="text-sm text-gray-600">Dolu</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.maintenance}</div>
              <div className="text-sm text-gray-600">Bakım</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
              <div className="text-sm text-gray-600">Kapalı</div>
                    </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.reserved}</div>
              <div className="text-sm text-gray-600">Rezerve</div>
                    </div>
                      </div>

                    {/* Search and Filter Section */}
          <div className="mb-8 animate-fade-in-up animation-delay-400">
            <div className="glass-card p-6">
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Otopark ara... (isim, adres)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium"
                  />
                </div>
              </div>

              {/* Status Filter and Sort Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                  className={`${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-700'} border-2 rounded-lg`}
                >
                  Tümü ({stats.total})
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.AVAILABLE ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.AVAILABLE)}
                  size="sm"
                  className={`${statusFilter === ParkingStatus.AVAILABLE ? 'bg-green-500 text-white' : 'bg-white/90 text-gray-700'} border-2 rounded-lg`}
                >
                  🟢 Müsait ({stats.available})
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.OCCUPIED ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.OCCUPIED)}
                  size="sm"
                  className={`${statusFilter === ParkingStatus.OCCUPIED ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'} border-2 rounded-lg`}
                >
                  🔴 Dolu ({stats.occupied})
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.MAINTENANCE ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.MAINTENANCE)}
                  size="sm"
                  className={`${statusFilter === ParkingStatus.MAINTENANCE ? 'bg-purple-500 text-white' : 'bg-white/90 text-gray-700'} border-2 rounded-lg`}
                >
                  🔧 Bakım ({stats.maintenance})
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.CLOSED ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.CLOSED)}
                  size="sm"
                  className={`${statusFilter === ParkingStatus.CLOSED ? 'bg-gray-500 text-white' : 'bg-white/90 text-gray-700'} border-2 rounded-lg`}
                >
                  🚫 Kapalı ({stats.closed})
                </Button>
                      <Button
                  variant={statusFilter === ParkingStatus.RESERVED ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.RESERVED)}
                  size="sm"
                  className={`${statusFilter === ParkingStatus.RESERVED ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-700'} border-2 rounded-lg`}
                >
                  🅿️ Rezerve ({stats.reserved})
                </Button>

                {/* Sort Buttons */}
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant={sortBy === 'distance' ? 'primary' : 'outline'}
                    onClick={() => setSortBy('distance')}
                    size="sm"
                    className={`px-4 py-2 font-semibold border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      sortBy === 'distance' 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white hover:border-blue-300'
                    }`}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    📍 Mesafeye Göre
                  </Button>
                  <Button
                    variant={sortBy === 'occupancy' ? 'primary' : 'outline'}
                    onClick={() => setSortBy('occupancy')}
                    size="sm"
                    className={`px-4 py-2 font-semibold border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      sortBy === 'occupancy' 
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white hover:border-purple-300'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    📊 Doluluga Göre
                  </Button>
                </div>
              </div>
            </div>
                        </div>

          {/* Main Content - Map Dominant Layout */}
          <div className="flex gap-6 h-[calc(100vh-14rem)]">
            
            {/* Map Section - Takes most of the space */}
            <div className="flex-1 relative">
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-gray-200 rounded-2xl h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (userLocation) {
                        setFocusLocation({ latitude: userLocation.latitude, longitude: userLocation.longitude })
                      }
                    }}
                    disabled={!userLocation}
                    className="bg-white/90 border-2 border-gray-300 hover:bg-green-500 hover:border-green-500 hover:text-white font-semibold shadow-lg hover:scale-110 transition-all duration-300 px-3 py-2"
                  >
                    📍 Konumuma Git
                      </Button>
                </div>

                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <DynamicMap
                    parkingLots={filteredParkingLots}
                    center={focusLocation || userLocation || DEFAULT_CENTER}
                    onParkingLotClick={handleParkingLotClick}
                    userLocation={userLocation || undefined}
                    height="100%"
                  />
                </div>
                <div className="absolute inset-0 ring-1 ring-white/20 rounded-2xl pointer-events-none"></div>
              </div>
            </div>

            {/* Sidebar - Parking List */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white/70 backdrop-blur-lg border-2 border-white/50 rounded-2xl h-full flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-100/70 to-purple-100/70 backdrop-blur-sm">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">🚗 Otoparklar</h2>
                  <div className="text-sm text-gray-700 font-medium">
                    {filteredParkingLots.length} otopark gösteriliyor
                  </div>
                </div>

                {/* Parking List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-gradient-to-b from-white/10 to-white/30">
                  {loading ? (
                    // Loading State
                    [...Array(5)].map((_, i) => (
                      <LoadingCard key={i} />
                    ))
                  ) : error ? (
                    // Error State
                    <div className="bg-white/80 backdrop-blur-sm border border-red-300 rounded-xl p-4 text-center shadow-lg">
                      <div className="text-red-500 mb-2 text-2xl">⚠️</div>
                      <div className="text-red-600 font-bold text-sm">Hata Oluştu</div>
                      <p className="text-gray-700 text-xs mt-1">{error}</p>
          </div>
                  ) : filteredParkingLots.length === 0 ? (
                    // Empty State
                    <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-6 text-center shadow-lg">
                      <div className="text-3xl mb-3">🔍</div>
                      <div className="text-gray-700 mb-1 font-bold">Otopark bulunamadı</div>
                      <p className="text-xs text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin</p>
                    </div>
                  ) : (
                    // Parking List
                    filteredParkingLots.map((lot) => {
                      const occupancy = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
                      const distance = getDistance(lot)
                      const statusStyle = getStatusStyle(lot.status, occupancy)

                  return (
                    <div
                      key={lot.id}
                          className={`bg-white/80 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg group ${
                        selectedLot?.id === lot.id 
                              ? `ring-2 ring-blue-500 bg-blue-50/80 border-blue-400 backdrop-blur-md` 
                              : `${statusStyle.borderColor} hover:bg-blue-50/60 border-2 hover:backdrop-blur-md`
                      }`}
                      onClick={() => handleParkingLotClick(lot)}
                    >
                          <div className="flex items-center space-x-3">
                            {/* Status Icon */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${statusStyle.color} ${statusStyle.bg} shadow-sm`}>
                              <span className="text-xl">{statusStyle.emoji}</span>
                        </div>
                        
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors duration-300">
                                  {lot.name}
                                </h3>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyle.color} ${statusStyle.bg}`}>
                                  {statusStyle.text}
                                </div>
                              </div>

                              <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                                {lot.address}
                              </p>

                              {/* Compact Stats */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-xs">
                                  {lot.status === ParkingStatus.AVAILABLE && (
                                    <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                                      <Car className="h-3 w-3 mr-1 text-green-600" />
                                      <span className="font-bold text-green-700">{lot.totalSpaces - lot.occupiedSpaces}</span>
                                    </div>
                                  )}
                                  {lot.status === ParkingStatus.AVAILABLE && (
                                    <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                                      <Clock className="h-3 w-3 mr-1 text-blue-600" />
                                      <span className="font-bold text-blue-700">{lot.hourlyRate}₺</span>
                                    </div>
                                  )}
                                  {lot.status === ParkingStatus.OCCUPIED && (
                                    <div className="flex items-center bg-red-100 px-2 py-1 rounded-full">
                                      <X className="h-3 w-3 mr-1 text-red-600" />
                                      <span className="font-bold text-red-700">Dolu</span>
                                    </div>
                                  )}
                                  {lot.status === ParkingStatus.MAINTENANCE && (
                                    <div className="flex items-center bg-purple-100 px-2 py-1 rounded-full">
                                      <WrenchIcon className="h-3 w-3 mr-1 text-purple-600" />
                                      <span className="font-bold text-purple-700">Bakım</span>
                                    </div>
                                  )}
                                  {lot.status === ParkingStatus.CLOSED && (
                                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                      <X className="h-3 w-3 mr-1 text-gray-600" />
                                      <span className="font-bold text-gray-700">Kapalı</span>
                                    </div>
                                  )}
                                  {lot.status === ParkingStatus.RESERVED && (
                                    <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                                      <Settings className="h-3 w-3 mr-1 text-blue-600" />
                                      <span className="font-bold text-blue-700">Rezerve</span>
                              </div>
                                  )}
                                  {distance && (
                                    <div className="flex items-center bg-purple-100 px-2 py-1 rounded-full">
                                      <MapPin className="h-3 w-3 mr-1 text-purple-600" />
                                      <span className="font-bold text-purple-700">{distance.toFixed(1)}</span>
                            </div>
                                  )}
                          </div>
                          
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openGoogleMapsDirection(lot.latitude, lot.longitude)
                                  }}
                                  className="bg-white/90 backdrop-blur-sm border border-gray-300 hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all duration-200 rounded-lg p-1.5 shadow-sm hover:shadow-md hover:scale-105"
                                >
                                  <Navigation className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>


                          </div>
      </main>
                        
      {/* Selected Lot Modal */}
      {selectedLot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end lg:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-lg border-2 border-white/50 rounded-2xl w-full max-w-lg p-8 animate-slide-up shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).color} ${getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).bg}`}>
                  <span className="text-2xl">{getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).emoji}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedLot.name}</h3>
                  <p className="text-sm text-gray-600">{getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).text}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLot(null)}
                className="hover:bg-red-100/80 hover:text-red-600 rounded-xl p-2 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm p-4 rounded-xl border border-white/60">
                <p className="text-gray-800 font-bold">📍 {selectedLot.address}</p>
                            </div>
                            
              {selectedLot.status === ParkingStatus.AVAILABLE && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <Car className="h-5 w-5 text-white" />
                                </div>
                                <div>
                        <div className="text-3xl font-bold text-green-600">
                          {selectedLot.totalSpaces - selectedLot.occupiedSpaces}
                        </div>
                        <div className="text-sm font-medium text-green-700">Boş Yer</div>
                      </div>
                                </div>
                              </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {selectedLot.hourlyRate}₺
                        </div>
                        <div className="text-sm font-medium text-blue-700">Saatlik</div>
                      </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
              {selectedLot.status === ParkingStatus.AVAILABLE && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="text-xl font-bold text-purple-600">
                      {selectedLot.totalSpaces}
                    </div>
                    <div className="text-sm text-purple-700">Toplam Kapasite</div>
                      </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <div className="text-xl font-bold text-orange-600">
                      %{calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)}
                    </div>
                    <div className="text-sm text-orange-700">Doluluk Oranı</div>
                  </div>
                </div>
              )}

              {selectedLot.status !== ParkingStatus.AVAILABLE && (
                <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-white/60 text-center shadow-lg">
                  <div className="text-6xl mb-4">{getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).emoji}</div>
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).text}
                  </div>
                  <div className="text-gray-700 font-medium">
                    {selectedLot.status === ParkingStatus.OCCUPIED && 'Şu anda hiç boş yer yok'}
                    {selectedLot.status === ParkingStatus.MAINTENANCE && 'Geçici olarak bakım çalışması yapılıyor'}
                    {selectedLot.status === ParkingStatus.CLOSED && 'Otopark geçici olarak kapatılmış'}
                    {selectedLot.status === ParkingStatus.RESERVED && 'Otopark özel etkinlik için rezerve edilmiş'}
                  </div>
                </div>
              )}

              <Button
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => openGoogleMapsDirection(selectedLot.latitude, selectedLot.longitude)}
              >
                <Navigation className="h-5 w-5 mr-2" />
                🗺️ Yol Tarifi Al
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .glass-card {
          @apply bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl;
        }
        .glass-header {
          @apply bg-white/80 backdrop-blur-lg border-b border-white/20;
        }
        .glass-button {
          @apply bg-white/50 backdrop-blur-sm border border-white/50 hover:bg-white/70;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.4) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
