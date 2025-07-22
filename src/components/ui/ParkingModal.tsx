import React from 'react'
import { X, Car, Clock, MapPin, Navigation } from 'lucide-react'
import Button from './Button'
import { ParkingLot } from '@/types/parking'
import { calculateOccupancyPercentage, formatCurrency } from '@/lib/utils'
import { getStatusStyle } from '@/utils/styleUtils'

interface ParkingModalProps {
  lot: ParkingLot | null
  isOpen: boolean
  onClose: () => void
  onNavigate: (lat: number, lng: number) => void
  isDarkMode: boolean
  distance?: number | null
}

export default function ParkingModal({ 
  lot, 
  isOpen, 
  onClose, 
  onNavigate, 
  isDarkMode,
  distance 
}: ParkingModalProps) {
  if (!isOpen || !lot) return null

  const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
  const statusStyle = getStatusStyle(lot.status, occupancyPercentage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800/95 border-gray-700 backdrop-blur-sm' 
          : 'bg-white/95 border-gray-200 backdrop-blur-sm'
      }`}>
        {/* Header */}
        <div className={`flex items-start justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {lot.name}
            </h3>
            <div className="flex items-center mt-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {lot.address}
              </span>
            </div>
            {distance && (
              <div className="flex items-center mt-1 text-sm">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Mesafe: {distance.toFixed(1)} km
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${statusStyle.bg} ${statusStyle.color} border ${statusStyle.borderColor}`}>
            <span className="mr-2">{statusStyle.emoji}</span>
            {statusStyle.text}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Parking Spaces */}
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Car className="h-5 w-5 text-blue-500" />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Boş Yer
                </span>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {lot.totalSpaces - lot.occupiedSpaces}
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  / {lot.totalSpaces} toplam
                </div>
              </div>
            </div>

            {/* Occupancy */}
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Doluluk
                </span>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  %{occupancyPercentage}
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formatCurrency(lot.hourlyRate)}/saat
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Doluluk Oranı
              </span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                %{occupancyPercentage}
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  occupancyPercentage < 50 
                    ? 'bg-green-500' 
                    : occupancyPercentage < 80 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button
            onClick={() => onNavigate(lot.latitude, lot.longitude)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Yol Tarifi Al
          </Button>
        </div>
      </div>
    </div>
  )
}
