import React from 'react'
import { Search, Filter, SortAsc, Navigation } from 'lucide-react'
import Button from '@/components/ui/Button'
import { ParkingStatus } from '@/types/parking'
import { getCardClasses } from '@/utils/styleUtils'

interface FilterControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: ParkingStatus | 'all'
  onStatusFilterChange: (status: ParkingStatus | 'all') => void
  sortBy: 'distance' | 'occupancy'
  onSortChange: (sort: 'distance' | 'occupancy') => void
  onLocationRequest: () => void
  isDarkMode: boolean
  isLocationLoading?: boolean
  showLocationButton?: boolean
}

export default function FilterControls({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onLocationRequest,
  isDarkMode,
  isLocationLoading = false,
  showLocationButton = true
}: FilterControlsProps) {
  const statusOptions = [
    { value: 'all', label: 'Tümü' },
    { value: ParkingStatus.AVAILABLE, label: 'Müsait' },
    { value: ParkingStatus.NEARLY_FULL, label: 'Az Yer' },
    { value: ParkingStatus.OCCUPIED, label: 'Dolu' },
    { value: ParkingStatus.CLOSED, label: 'Kapalı' }
  ]

  return (
    <div className={getCardClasses(isDarkMode, 'p-6 mb-8')}>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Otopark adı veya adres ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as ParkingStatus | 'all')}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white'
                    : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex-1">
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as 'distance' | 'occupancy')}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white'
                    : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
              >
                <option value="distance">Mesafeye Göre</option>
                <option value="occupancy">Doluluk Oranına Göre</option>
              </select>
            </div>
          </div>

          {/* Location Button */}
          {showLocationButton && (
            <div className="sm:w-auto">
              <Button
                variant="outline"
                onClick={onLocationRequest}
                disabled={isLocationLoading}
                className="w-full sm:w-auto"
              >
                {isLocationLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                    Konum Alınıyor...
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5 mr-2" />
                    Konumumu Al
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 