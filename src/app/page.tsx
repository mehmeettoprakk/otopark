'use client'

import { useState, useEffect } from 'react'
import { Navigation } from 'lucide-react'
import DynamicMap from '@/components/Map/DynamicMap'
import Header from '@/components/layout/Header'
import HeroSection from '@/components/sections/HeroSection'
import StatisticsSection from '@/components/sections/StatisticsSection'
import FilterControls from '@/components/controls/FilterControls'
import ParkingListSidebar from '@/components/sections/ParkingListSidebar'
import ParkingModal from '@/components/ui/ParkingModal'
import Button from '@/components/ui/Button'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { useParkingLots } from '@/hooks/useFirebase'
import { useLocation } from '@/hooks/useLocation'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useParkingOperations } from '@/hooks/useParkingOperations'
import { ParkingLot, ParkingStatus } from '@/types/parking'
import { APP_CONFIG } from '@/constants/app'
import { getDarkModeClasses, COMMON_CLASSES } from '@/utils/styleUtils'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  // Custom hooks for state management
  const { parkingLots, loading, error } = useParkingLots()
  const { userLocation, isLocationLoading, requestLocation } = useLocation()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // Local state
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
  const [sortBy, setSortBy] = useState<'distance' | 'occupancy'>('distance')
  const [focusLocation, setFocusLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ParkingStatus | 'all'>('all')
  const [showParkingModal, setShowParkingModal] = useState(false)

  // Parking operations hook
  const {
    filteredParkingLots,
    statistics,
    getDistance,
    openGoogleMapsDirection
  } = useParkingOperations({
    parkingLots,
    userLocation,
    searchQuery,
    statusFilter,
    sortBy
  })

  // Event handlers
  const handleParkingLotClick = (lot: ParkingLot) => {
    setSelectedLot(lot)
    setShowParkingModal(true)
    // Haritayı otoparka yumuşak bir şekilde odakla
    setTimeout(() => {
      setFocusLocation({ latitude: lot.latitude, longitude: lot.longitude })
    }, 100)
  }

  const handleCloseModal = () => {
    setShowParkingModal(false)
  }

  // Kullanıcı konumu değiştiğinde haritayı odakla
  useEffect(() => {
    if (userLocation && !focusLocation) {
      setTimeout(() => {
        setFocusLocation({ latitude: userLocation.latitude, longitude: userLocation.longitude })
      }, 500)
    }
  }, [userLocation, focusLocation])

  const darkModeClasses = getDarkModeClasses(isDarkMode)

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bağlantı Hatası</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <LoadingScreen 
        message="Otopark Verileri Yükleniyor"
        description="Lütfen bekleyin..."
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-300 ${darkModeClasses.background}`}>
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <div className={COMMON_CLASSES.container}>
          {/* Hero Section */}
          <div className="py-8">
            <HeroSection isDarkMode={isDarkMode} />

            {/* Statistics */}
            <StatisticsSection statistics={statistics} isDarkMode={isDarkMode} />

            {/* Filter Controls */}
            <FilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onLocationRequest={requestLocation}
              isDarkMode={isDarkMode}
              isLocationLoading={isLocationLoading}
              showLocationButton={false}
            />

            {/* Map and Sidebar Layout - Yan yana */}
            <div className="flex flex-col lg:flex-row gap-8 mb-16">
              {/* Map Container - Sol taraf */}
              <div className="flex-1 relative">
                <div className="w-full h-[60vh] lg:h-[70vh] rounded-2xl overflow-hidden">
                  <DynamicMap
                    parkingLots={filteredParkingLots}
                    center={userLocation || APP_CONFIG.DEFAULT_CENTER}
                    onParkingLotClick={handleParkingLotClick}
                    userLocation={userLocation || undefined}
                    focusLocation={focusLocation}
                    height="100%"
                  />
                </div>
                <div className="absolute inset-0 ring-1 ring-white/20 rounded-2xl pointer-events-none"></div>
                
                {/* Konum Butonu - Harita üzerinde */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (userLocation) {
                        // Benzersiz object referansı oluştur
                        setFocusLocation({ 
                          latitude: userLocation.latitude + Math.random() * 0.000001, // Tiny offset to make unique
                          longitude: userLocation.longitude + Math.random() * 0.000001 
                        })
                      } else {
                        // Konum yoksa al
                        requestLocation()
                      }
                    }}
                    disabled={isLocationLoading}
                    className={`shadow-lg backdrop-blur-sm ${
                      isDarkMode 
                        ? 'bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80' 
                        : 'bg-white/80 border-gray-300 text-gray-900 hover:bg-white/90'
                    }`}
                  >
                    {isLocationLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                        Alınıyor...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        {userLocation ? 'Konuma Git' : 'Konum Al'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Sidebar - Sağ taraf */}
              <div className="w-full lg:w-96 lg:flex-shrink-0">
                <ParkingListSidebar
                  parkingLots={filteredParkingLots}
                  selectedLot={selectedLot}
                  onParkingLotClick={handleParkingLotClick}
                  getDistance={getDistance}
                  openGoogleMapsDirection={openGoogleMapsDirection}
                  isDarkMode={isDarkMode}
                  loading={loading}
                />
              </div>
            </div>
          </div>
                          </div>
      </main>

      {/* Parking Modal */}
      <ParkingModal
        lot={selectedLot}
        isOpen={showParkingModal}
        onClose={handleCloseModal}
        onNavigate={openGoogleMapsDirection}
        isDarkMode={isDarkMode}
        distance={selectedLot ? getDistance(selectedLot) : null}
      />

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  )
}
