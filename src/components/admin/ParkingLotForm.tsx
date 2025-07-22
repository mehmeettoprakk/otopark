import React, { useState, useEffect } from 'react'
import { Car, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ParkingLot, ParkingStatus } from '@/types/parking'
import { APP_CONFIG } from '@/constants/app'
import { useDarkMode } from '@/hooks/useDarkMode'

interface ParkingLotFormProps {
  lot?: ParkingLot | Partial<ParkingLot>
  onSave: (data: Partial<ParkingLot>) => void
  onCancel: () => void
}

interface FormData {
  name: string
  address: string
  latitude: string
  longitude: string
  totalSpaces: string
  occupiedSpaces: string
  hourlyRate: string
  isActive: boolean
  status: ParkingStatus
}

export default function ParkingLotForm({ lot, onSave, onCancel }: ParkingLotFormProps) {
  const { isDarkMode } = useDarkMode()
  const [formData, setFormData] = useState<FormData>({
    name: lot?.name || '',
    address: lot?.address || '',
    latitude: lot?.latitude?.toString() || '',
    longitude: lot?.longitude?.toString() || '',
    totalSpaces: lot?.totalSpaces?.toString() || '',
    occupiedSpaces: lot?.occupiedSpaces?.toString() || '',
    hourlyRate: lot?.hourlyRate?.toString() || '',
    isActive: lot?.isActive ?? true,
    status: lot?.status || ParkingStatus.AVAILABLE
  })

  // Auto-update status based on occupancy percentage
  useEffect(() => {
    const total = parseInt(formData.totalSpaces) || 0
    const occupied = parseInt(formData.occupiedSpaces) || 0
    
    if (total > 0) {
      const occupancyPercentage = (occupied / total) * 100
      
      let newStatus: ParkingStatus
      if (occupancyPercentage >= APP_CONFIG.OCCUPANCY_THRESHOLDS.OCCUPIED) {
        newStatus = ParkingStatus.OCCUPIED
      } else if (occupancyPercentage >= APP_CONFIG.OCCUPANCY_THRESHOLDS.FULL) {
        newStatus = ParkingStatus.NEARLY_FULL
      } else {
        newStatus = ParkingStatus.AVAILABLE
      }
      
      if (formData.status !== newStatus) {
        setFormData(prev => ({ ...prev, status: newStatus }))
      }
    }
  }, [formData.totalSpaces, formData.occupiedSpaces, formData.status])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      totalSpaces: parseInt(formData.totalSpaces) || 0,
      occupiedSpaces: parseInt(formData.occupiedSpaces) || 0,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      status: formData.status
    })
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isEditing = !!lot

  return (
    <Card className={`backdrop-blur-lg border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/80 border-gray-700/50' 
        : 'bg-white/80 border-white/50'
    }`}>
      <CardHeader className={`border-b px-8 py-6 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-700/50 border-gray-700/30' 
          : 'bg-gradient-to-r from-blue-100/70 to-purple-100/70 border-white/20'
      }`}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-2xl font-bold flex items-center space-x-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span>{isEditing ? '✏️ Otoparkı Düzenle' : '➕ Yeni Otopark Ekle'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🏢 Otopark Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Örn: Merkez AVM Otoparkı"
              />
            </div>

            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                📍 Adres *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Örn: Atatürk Cad. No:123, Merkez/Ankara"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🌍 Enlem (Latitude) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Örn: 39.9334"
              />
            </div>

            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🌐 Boylam (Longitude) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Örn: 32.8597"
              />
            </div>
          </div>

          {/* Capacity and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🏢 Toplam Kapasite *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalSpaces}
                onChange={(e) => handleInputChange('totalSpaces', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Örn: 150"
              />
            </div>

            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🚗 Şu An Dolu Araç Sayısı
              </label>
              <input
                type="number"
                min="0"
                value={formData.occupiedSpaces}
                onChange={(e) => handleInputChange('occupiedSpaces', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Örn: 45"
              />
            </div>

            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                💰 Saatlik Park Ücreti (₺)
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={formData.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Örn: 12.50"
              />
            </div>
          </div>

          {/* Status and Active State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                📊 Otopark Durumu
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as ParkingStatus)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-100' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value={ParkingStatus.AVAILABLE}>✅ Müsait</option>
                <option value={ParkingStatus.NEARLY_FULL}>⚠️ Az Yer</option>
                <option value={ParkingStatus.OCCUPIED}>🚫 Dolu</option>
                <option value={ParkingStatus.MAINTENANCE}>🔧 Bakımda</option>
                <option value={ParkingStatus.CLOSED}>🔒 Kapalı</option>
                <option value={ParkingStatus.RESERVED}>🔷 Rezerve</option>
              </select>
            </div>

            <div>
              <label className={`flex items-center text-sm font-bold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🔧 Aktiflik Durumu
              </label>
              <div className="flex items-center space-x-3 mt-4">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {formData.isActive ? '✅ Aktif' : '❌ Pasif'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className={`flex justify-end space-x-4 pt-6 border-t transition-colors duration-300 ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              ❌ İptal
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
            >
              {isEditing ? '✅ Güncelle' : '➕ Ekle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 