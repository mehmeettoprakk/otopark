import React from 'react'
import { MapPin, Clock, Car, Navigation } from 'lucide-react'
import Button from '@/components/ui/Button'
import { ParkingLot } from '@/types/parking'
import { calculateOccupancyPercentage, formatCurrency } from '@/lib/utils'
import { getStatusStyle } from '@/utils/styleUtils'
import { getCardClasses, getTextClasses, getDarkModeClasses } from '@/utils/styleUtils'

interface ParkingListSidebarProps {
  parkingLots: ParkingLot[]
  selectedLot: ParkingLot | null
  onParkingLotClick: (lot: ParkingLot) => void
  getDistance: (lot: ParkingLot) => number | null
  openGoogleMapsDirection: (lat: number, lng: number) => void
  isDarkMode: boolean
  loading: boolean
}

interface ParkingCardProps {
  lot: ParkingLot
  isSelected: boolean
  distance: number | null
  onSelect: () => void
  onNavigate: () => void
  isDarkMode: boolean
}

function ParkingCard({
  lot,
  isSelected,
  distance,
  onSelect,
  onNavigate,
  isDarkMode
}: ParkingCardProps) {
  const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
  const statusStyle = getStatusStyle(lot.status, occupancyPercentage)

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isSelected
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg scale-105'
          : isDarkMode
          ? 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
          : 'border-gray-200/50 bg-white/30 hover:border-gray-300'
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`font-semibold text-sm leading-tight ${getTextClasses('primary', isDarkMode)}`}>
              {lot.name}
            </h3>
            <p className={`text-xs mt-1 ${getTextClasses('secondary', isDarkMode)}`}>
              {lot.address}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${statusStyle.bg} ${statusStyle.color} border ${statusStyle.borderColor}`}>
            <span className="mr-1">{statusStyle.emoji}</span>
            {statusStyle.text}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'}`}>
            <div className="flex items-center space-x-1">
              <Car className="h-3 w-3 text-blue-500" />
              <span className={getTextClasses('muted', isDarkMode)}>Doluluk</span>
            </div>
            <div className={`font-semibold ${getTextClasses('primary', isDarkMode)}`}>
              {lot.occupiedSpaces}/{lot.totalSpaces} (%{occupancyPercentage})
            </div>
          </div>
          
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'}`}>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-green-500" />
              <span className={getTextClasses('muted', isDarkMode)}>Saatlik</span>
            </div>
            <div className={`font-semibold ${getTextClasses('primary', isDarkMode)}`}>
              {formatCurrency(lot.hourlyRate)}
            </div>
          </div>
        </div>

        {/* Distance and Navigation */}
        <div className="flex justify-between items-center">
          {distance !== null && (
            <div className="flex items-center space-x-1 text-xs">
              <MapPin className="h-3 w-3 text-orange-500" />
              <span className={getTextClasses('muted', isDarkMode)}>
                {distance.toFixed(1)} km
              </span>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate()
            }}
            className="text-xs px-3 py-1"
          >
            <Navigation className="h-3 w-3 mr-1" />
            Yol Tarifi
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ParkingListSidebar({
  parkingLots,
  selectedLot,
  onParkingLotClick,
  getDistance,
  openGoogleMapsDirection,
  isDarkMode,
  loading
}: ParkingListSidebarProps) {
  const darkModeClasses = getDarkModeClasses(isDarkMode)

  if (loading) {
    return (
      <div className="w-full">
        <div className={getCardClasses(isDarkMode, 'h-[60vh] lg:h-[70vh] flex items-center justify-center')}>
          <div className="text-center">
            {/* Modern car loading animation */}
            <div className="relative mb-6">
              <div className={`w-16 h-16 border-4 rounded-full mx-auto animate-spin ${
                isDarkMode 
                  ? 'border-gray-700 border-t-blue-400' 
                  : 'border-gray-200 border-t-blue-600'
              }`}></div>
              <div className={`absolute inset-0 flex items-center justify-center ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <Car className="w-6 h-6 animate-bounce" />
              </div>
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Otoparklar Yükleniyor
            </h3>
            <p className={getTextClasses('muted', isDarkMode)}>Lütfen bekleyin...</p>
            
            {/* Loading dots */}
            <div className="flex justify-center space-x-2 mt-4">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
              }`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
              }`} style={{ animationDelay: '150ms' }}></div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
              }`} style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className={`${getCardClasses(isDarkMode)} h-[60vh] lg:h-[70vh] flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`p-6 border-b backdrop-blur-sm transition-colors duration-300 ${darkModeClasses.sidebar}`}>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🚗 Otoparklar
          </h2>
          <div className={`text-sm font-medium transition-colors duration-300 ${getTextClasses('secondary', isDarkMode)}`}>
            {parkingLots.length} otopark gösteriliyor
          </div>
        </div>

        {/* Parking List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {parkingLots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Car className={`h-12 w-12 mb-4 ${getTextClasses('muted', isDarkMode)}`} />
              <p className={`font-medium ${getTextClasses('primary', isDarkMode)}`}>
                Otopark bulunamadı
              </p>
              <p className={`text-sm mt-2 ${getTextClasses('muted', isDarkMode)}`}>
                Arama kriterlerinizi değiştirmeyi deneyin
              </p>
            </div>
          ) : (
            parkingLots.map((lot) => (
              <ParkingCard
                key={lot.id}
                lot={lot}
                isSelected={selectedLot?.id === lot.id}
                distance={getDistance(lot)}
                onSelect={() => onParkingLotClick(lot)}
                onNavigate={() => openGoogleMapsDirection(lot.latitude, lot.longitude)}
                isDarkMode={isDarkMode}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 