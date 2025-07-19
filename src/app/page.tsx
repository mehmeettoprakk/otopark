'use client'

import { useState, useEffect } from 'react'
import DynamicMap from '@/components/Map/DynamicMap'
import Button from '@/components/ui/Button'
import { useParkingLots } from '@/hooks/useFirebase'
import { ParkingLot, MapLocation, ParkingStatus } from '@/types/parking'
import { calculateOccupancyPercentage, calculateDistance } from '@/lib/utils'
import { MapPin, Clock, Car, TrendingUp, Navigation, X, Search, Zap, Settings, WrenchIcon, Sun, Moon, Heart, Github, Mail, Phone, MapIcon, Menu } from 'lucide-react'

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
const LoadingCard = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`backdrop-blur-sm border rounded-xl p-4 animate-pulse shadow-lg transition-colors duration-300 ${
    isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-white/60 border-white/60'
  }`}>
    <div className="flex items-center space-x-3">
      <div className={`w-12 h-12 rounded-xl ${
        isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-500' : 'bg-gradient-to-r from-blue-200 to-purple-200'
      }`}></div>
      <div className="flex-1 space-y-2">
        <div className={`h-3 rounded w-3/4 ${
          isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-500' : 'bg-gradient-to-r from-blue-200 to-purple-200'
        }`}></div>
        <div className={`h-2 rounded w-1/2 ${
          isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-500' : 'bg-gradient-to-r from-blue-200 to-purple-200'
        }`}></div>
        <div className="flex space-x-2">
          <div className={`h-4 rounded w-12 ${
            isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-500' : 'bg-gradient-to-r from-blue-200 to-purple-200'
          }`}></div>
          <div className={`h-4 rounded w-12 ${
            isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-500' : 'bg-gradient-to-r from-blue-200 to-purple-200'
          }`}></div>
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [statusFilter, setStatusFilter] = useState<ParkingStatus | 'all'>('all')

  // Dark mode toggle fonksiyonu
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    localStorage.setItem('darkMode', (!isDarkMode).toString())
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

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

  // Dark mode'u localStorage'dan yükle
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Mobile menu dışında tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('header')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 top-0 backdrop-blur-lg transition-colors duration-300 border-b ${
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-700/50 shadow-lg' 
          : 'bg-white/80 border-white/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-2">
            {/* Logo */}
                          <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Otopark Takip
                  </h1>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Gerçek zamanlı otopark doluluk takibi</p>
                </div>
              </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={toggleDarkMode}
                className={`hover:scale-110 transition-all duration-200 p-3 border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50' 
                    : 'bg-white/50 border-white/50 hover:bg-white/70'
                }`}
                title={isDarkMode ? 'Aydınlık Tema' : 'Karanlık Tema'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-600" />
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`hover:scale-110 transition-all duration-200 p-3 border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50' 
                    : 'bg-white/50 border-white/50 hover:bg-white/70'
                }`}
                title="Menü"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-5">
              <Button 
                variant="ghost" 
                className={`px-4 py-2 text-base transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                Canlı
              </Button>
              <Button 
                variant="outline"
                onClick={toggleDarkMode}
                className={`hover:scale-110 transition-all duration-200 p-3 border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50' 
                    : 'bg-white/50 border-white/50 hover:bg-white/70'
                }`}
                title={isDarkMode ? 'Aydınlık Tema' : 'Karanlık Tema'}
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6 text-yellow-500" />
                ) : (
                  <Moon className="h-6 w-6 text-blue-600" />
                )}
              </Button>
              <Button 
                variant="outline" 
                className={`px-4 py-2 text-base transition-all duration-200 border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 text-gray-200' 
                    : 'bg-white/50 border-white/50 hover:bg-white/70 text-gray-700'
                }`}
                onClick={() => window.location.href = '/admin'}
              >
                Admin Panel
              </Button>
            </nav>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className={`md:hidden border-t transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="space-y-3">
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start px-4 py-3 text-base transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    🔴 Canlı
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start px-4 py-3 text-base transition-all duration-200 border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 text-gray-200' 
                        : 'bg-white/50 border-gray-300 hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => {
                      window.location.href = '/admin'
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    ⚙️ Admin Panel
                  </Button>
                </nav>
              </div>
            </div>
          )}
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
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in-up transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              En Yakın <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Otoparkları</span> Keşfedin
            </h2>
            <p className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto animate-fade-in-up animation-delay-200 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Akıllı algoritma ile size en uygun park yerini bulun. Gerçek zamanlı doluluk oranları ve mesafe bilgileri.
            </p>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 mb-8 animate-fade-in-up animation-delay-300">
            <div className={`p-3 sm:p-4 text-center rounded-2xl shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'
            }`}>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Toplam</div>
            </div>
            <div className={`p-3 sm:p-4 text-center rounded-2xl shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'
            }`}>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.available}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Müsait</div>
            </div>
            <div className={`p-3 sm:p-4 text-center rounded-2xl shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'
            }`}>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.occupied}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Dolu</div>
            </div>
            <div className={`p-3 sm:p-4 text-center rounded-2xl shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'
            }`}>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.maintenance}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Bakım</div>
            </div>
            <div className={`p-3 sm:p-4 text-center rounded-2xl shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'
            }`}>
              <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.closed}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Kapalı</div>
                    </div>
            <div className={`p-3 sm:p-4 text-center rounded-2xl shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'
            }`}>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.reserved}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Rezerve</div>
                    </div>
                      </div>

                    {/* Search and Filter Section */}
          <div className="mb-8 animate-fade-in-up animation-delay-400">
            <div className={`p-6 rounded-2xl shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'
            }`}>
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Otopark ara... (isim, adres)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 font-medium ${
                      isDarkMode 
                        ? 'bg-gray-700/80 border-gray-600/50 text-gray-100 placeholder-gray-400 focus:bg-gray-700' 
                        : 'bg-white/80 border-white/50 text-gray-900 placeholder-gray-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Status Filter and Sort Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                  className={`border-2 rounded-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                    statusFilter === 'all' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : isDarkMode 
                        ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white'
                  }`}
                >
                  <span className="hidden sm:inline">Tümü ({stats.total})</span>
                  <span className="sm:hidden">Tümü</span>
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.AVAILABLE ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.AVAILABLE)}
                  size="sm"
                  className={`border-2 rounded-lg transition-all duration-300 ${
                    statusFilter === ParkingStatus.AVAILABLE 
                      ? 'bg-green-500 text-white border-green-500' 
                      : isDarkMode 
                        ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white'
                  }`}
                >
                  🟢 Müsait ({stats.available})
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.OCCUPIED ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.OCCUPIED)}
                  size="sm"
                  className={`border-2 rounded-lg transition-all duration-300 ${
                    statusFilter === ParkingStatus.OCCUPIED 
                      ? 'bg-red-500 text-white border-red-500' 
                      : isDarkMode 
                        ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white'
                  }`}
                >
                  🔴 Dolu ({stats.occupied})
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.MAINTENANCE ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.MAINTENANCE)}
                  size="sm"
                  className={`border-2 rounded-lg transition-all duration-300 ${
                    statusFilter === ParkingStatus.MAINTENANCE 
                      ? 'bg-purple-500 text-white border-purple-500' 
                      : isDarkMode 
                        ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white'
                  }`}
                >
                  🔧 Bakım ({stats.maintenance})
                </Button>
                <Button
                  variant={statusFilter === ParkingStatus.CLOSED ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.CLOSED)}
                  size="sm"
                  className={`border-2 rounded-lg transition-all duration-300 ${
                    statusFilter === ParkingStatus.CLOSED 
                      ? 'bg-gray-500 text-white border-gray-500' 
                      : isDarkMode 
                        ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white'
                  }`}
                >
                  🚫 Kapalı ({stats.closed})
                </Button>
                      <Button
                  variant={statusFilter === ParkingStatus.RESERVED ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(ParkingStatus.RESERVED)}
                  size="sm"
                  className={`border-2 rounded-lg transition-all duration-300 ${
                    statusFilter === ParkingStatus.RESERVED 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : isDarkMode 
                        ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white'
                  }`}
                >
                  🅿️ Rezerve ({stats.reserved})
                </Button>

                {/* Sort Buttons */}
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant={sortBy === 'distance' ? 'primary' : 'outline'}
                    onClick={() => setSortBy('distance')}
                    size="sm"
                    className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      sortBy === 'distance' 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                        : isDarkMode 
                          ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-blue-400' 
                          : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white hover:border-blue-300'
                    }`}
                  >
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">📍 Mesafeye Göre</span>
                    <span className="sm:hidden">📍</span>
                  </Button>
                  <Button
                    variant={sortBy === 'occupancy' ? 'primary' : 'outline'}
                    onClick={() => setSortBy('occupancy')}
                    size="sm"
                    className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      sortBy === 'occupancy' 
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg' 
                        : isDarkMode 
                          ? 'bg-gray-700/90 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-purple-400' 
                          : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-white hover:border-purple-300'
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">📊 Doluluga Göre</span>
                    <span className="sm:hidden">📊</span>
                  </Button>
                </div>
              </div>
            </div>
                        </div>

          {/* Main Content - Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-14rem)]">
            
            {/* Map Section - Full width on mobile, flexible on desktop */}
            <div className="w-full lg:flex-1 relative h-[50vh] lg:h-full">
              <div className={`border-2 rounded-2xl h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-blue-900 to-purple-900 border-gray-700' 
                  : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-gray-200'
              }`}>
                
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
                    className={`border-2 font-semibold shadow-lg hover:scale-110 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                      isDarkMode 
                        ? 'bg-gray-800/90 border-gray-600 hover:bg-green-500 hover:border-green-500 hover:text-white text-gray-200' 
                        : 'bg-white/90 border-gray-300 hover:bg-green-500 hover:border-green-500 hover:text-white text-gray-700'
                    }`}
                  >
                    <span className="hidden sm:inline">📍 Konumuma Git</span>
                    <span className="sm:hidden">📍</span>
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
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <div className={`backdrop-blur-lg border-2 rounded-2xl h-[60vh] lg:h-full flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/70 border-gray-700/50' 
                  : 'bg-white/70 border-white/50'
              }`}>
                
                {/* Sidebar Header */}
                <div className={`p-6 border-b backdrop-blur-sm transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-gray-700/20 bg-gradient-to-r from-gray-700/70 to-blue-800/70' 
                    : 'border-white/20 bg-gradient-to-r from-blue-100/70 to-purple-100/70'
                }`}>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">🚗 Otoparklar</h2>
                  <div className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {filteredParkingLots.length} otopark gösteriliyor
                  </div>
                </div>

                {/* Parking List */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-gray-800/10 to-gray-700/30' 
                    : 'bg-gradient-to-b from-white/10 to-white/30'
                }`}>
                  {loading ? (
                    // Loading State
                    [...Array(5)].map((_, i) => (
                      <LoadingCard key={i} isDarkMode={isDarkMode} />
                    ))
                  ) : error ? (
                    // Error State
                    <div className={`backdrop-blur-sm border border-red-300 rounded-xl p-4 text-center shadow-lg transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
                    }`}>
                      <div className="text-red-500 mb-2 text-2xl">⚠️</div>
                      <div className="text-red-600 font-bold text-sm">Hata Oluştu</div>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{error}</p>
          </div>
                  ) : filteredParkingLots.length === 0 ? (
                    // Empty State
                    <div className={`backdrop-blur-sm border rounded-xl p-6 text-center shadow-lg transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white/80 border-white/60'
                    }`}>
                      <div className="text-3xl mb-3">🔍</div>
                      <div className={`mb-1 font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Otopark bulunamadı</div>
                      <p className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Arama kriterlerinizi değiştirmeyi deneyin</p>
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
                          className={`backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg group ${
                        selectedLot?.id === lot.id 
                              ? isDarkMode 
                                ? `ring-2 ring-blue-500 bg-blue-900/80 border-blue-400 backdrop-blur-md` 
                                : `ring-2 ring-blue-500 bg-blue-50/80 border-blue-400 backdrop-blur-md`
                              : isDarkMode 
                                ? `${statusStyle.borderColor} hover:bg-blue-900/60 border-2 hover:backdrop-blur-md bg-gray-800/80`
                                : `${statusStyle.borderColor} hover:bg-blue-50/60 border-2 hover:backdrop-blur-md bg-white/80`
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
                                <h3 className={`font-bold text-sm truncate group-hover:text-blue-600 transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                  {lot.name}
                                </h3>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyle.color} ${statusStyle.bg}`}>
                                  {statusStyle.text}
                                </div>
                              </div>

                              <p className={`text-xs mb-3 line-clamp-1 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
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
                                  className={`backdrop-blur-sm border hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all duration-200 rounded-lg p-1.5 shadow-sm hover:shadow-md hover:scale-105 ${
                                    isDarkMode 
                                      ? 'bg-gray-700/90 border-gray-600 text-gray-200' 
                                      : 'bg-white/90 border-gray-300 text-gray-700'
                                  }`}
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

      {/* Footer */}
      <footer className={`relative z-10 mt-16 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/95 border-gray-700/50' 
          : 'bg-white/95 border-gray-200/50'
      } backdrop-blur-lg border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Company Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Car className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Otopark Takip
                  </h3>
                </div>
              </div>
              <p className={`text-xs sm:text-sm transition-colors duration-300 leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Akıllı otopark yönetim sistemi ile park yerinizi kolayca bulun.
              </p>
              <div className="flex space-x-2">
                <a
                  href="#"
                  className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white' 
                      : 'bg-gray-100 hover:bg-blue-500 text-gray-600 hover:text-white'
                  }`}
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white' 
                      : 'bg-gray-100 hover:bg-green-500 text-gray-600 hover:text-white'
                  }`}
                  title="WhatsApp"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white' 
                      : 'bg-gray-100 hover:bg-red-500 text-gray-600 hover:text-white'
                  }`}
                  title="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className={`text-base font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Hızlı Linkler
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="#"
                    className={`text-xs sm:text-sm transition-colors duration-200 hover:text-blue-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Anasayfa
                  </a>
                </li>
                <li>
                  <a
                    href="/admin"
                    className={`text-xs sm:text-sm transition-colors duration-200 hover:text-blue-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Admin Panel
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-xs sm:text-sm transition-colors duration-200 hover:text-blue-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Hakkımızda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`text-xs sm:text-sm transition-colors duration-200 hover:text-blue-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    İletişim
                  </a>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className={`text-base font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Özellikler
              </h4>
              <ul className="space-y-1.5">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Gerçek Zamanlı Takip
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Navigasyon Desteği
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Mesafe Hesaplama
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Akıllı Filtreleme
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className={`text-base font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                İletişim
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <MapIcon className={`h-3 w-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      İstanbul, Türkiye
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <Mail className={`h-3 w-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      info@otoparktakip.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <Phone className={`h-3 w-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      +90 (555) 123 45 67
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={`mt-6 pt-4 border-t transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-1 text-xs sm:text-sm">
                <span className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  © 2024 Otopark Takip. Tüm hakları saklıdır.
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm">
                <span className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Made with
                </span>
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 animate-pulse" />
                <span className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  by Otopark Takip Team
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
                        
      {/* Selected Lot Modal */}
              {selectedLot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end lg:items-center justify-center p-4 animate-fade-in">
          <div className={`backdrop-blur-lg border-2 rounded-2xl w-full max-w-lg p-4 sm:p-6 lg:p-8 animate-slide-up shadow-2xl hover:shadow-3xl transition-shadow duration-300 max-h-[90vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-white/50'
          }`}>
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).color} ${getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).bg}`}>
                  <span className="text-lg sm:text-2xl">{getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).emoji}</span>
                </div>
                <div>
                                       <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>{selectedLot.name}</h3>
                     <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                       isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     }`}>{getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).text}</p>
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
              <div className={`backdrop-blur-sm p-4 rounded-xl border transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-700/80 to-blue-800/80 border-gray-600/60' 
                  : 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-white/60'
              }`}>
                <p className={`font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>📍 {selectedLot.address}</p>
                            </div>
                            
              {selectedLot.status === ParkingStatus.AVAILABLE && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl border-2 border-green-200 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <Car className="h-5 w-5 text-white" />
                                </div>
                                <div>
                        <div className="text-2xl sm:text-3xl font-bold text-green-600">
                          {selectedLot.totalSpaces - selectedLot.occupiedSpaces}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-green-700">Boş Yer</div>
                      </div>
                                </div>
                              </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl border-2 border-blue-200 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {selectedLot.hourlyRate}₺
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-blue-700">Saatlik</div>
                      </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
              {selectedLot.status === ParkingStatus.AVAILABLE && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl border border-purple-200">
                    <div className="text-xl font-bold text-purple-600">
                      {selectedLot.totalSpaces}
                    </div>
                    <div className="text-sm text-purple-700">Toplam Kapasite</div>
                      </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-xl border border-orange-200">
                    <div className="text-xl font-bold text-orange-600">
                      %{calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)}
                    </div>
                    <div className="text-sm text-orange-700">Doluluk Oranı</div>
                  </div>
                </div>
              )}

              {selectedLot.status !== ParkingStatus.AVAILABLE && (
                <div className={`backdrop-blur-sm p-6 rounded-2xl border-2 text-center shadow-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-700/80 to-gray-800/80 border-gray-600/60' 
                    : 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-white/60'
                }`}>
                  <div className="text-6xl mb-4">{getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).emoji}</div>
                  <div className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {getStatusStyle(selectedLot.status, calculateOccupancyPercentage(selectedLot.occupiedSpaces, selectedLot.totalSpaces)).text}
                  </div>
                  <div className={`font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
