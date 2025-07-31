'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, X, Check, Navigation } from 'lucide-react'

// Leaflet marker icon sorunu için fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationData {
  lat: number
  lng: number
  address: string
  name?: string
  details?: {
    road?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    country?: string
  }
}

interface FullPageLocationPickerProps {
  onLocationSelect: (location: LocationData) => void
  onCancel: () => void
  initialLocation?: LocationData
}

export default function FullPageLocationPicker({ 
  onLocationSelect, 
  onCancel,
  initialLocation
}: FullPageLocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Türkiye merkezi (Kırşehir civarı) - daha dengeli görünüm
    const defaultCenter = initialLocation 
      ? [initialLocation.lat, initialLocation.lng] 
      : [39.1667, 35.1667]

    // Haritayı initialize et
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 60,
      wheelPxPerZoomLevel: 60,
    }).setView(defaultCenter as [number, number], initialLocation ? 13 : 6)

    // Güzel tile layer - CartoDB Positron
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current)

    // Zoom kontrollerini sağ alta ekle
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapRef.current)

    // Attributions ekle
    L.control.attribution({
      position: 'bottomleft',
      prefix: '<a href="https://leafletjs.com" target="_blank">Leaflet</a>'
    }).addTo(mapRef.current)

    // Harita stili
    mapRef.current.getContainer().style.borderRadius = '16px'
    mapRef.current.getContainer().style.overflow = 'hidden'
    mapRef.current.getContainer().style.background = 'linear-gradient(135deg, #f0f9ff, #e0e7ff, #fdf2f8)'

    // Başlangıç konumu marker'ı ekle
    if (initialLocation) {
      addMarker(initialLocation.lat, initialLocation.lng)
    }

    // Harita tıklama eventi
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      addMarker(lat, lng)
      
      // Reverse geocoding ile detaylı bilgi al
      getReverseGeocode(lat, lng)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [initialLocation])

  const addMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return

    // Önceki marker'ı kaldır
    if (markerRef.current) {
      markerRef.current.remove()
    }

    // Yeni marker ekle - daha güzel tasarım
    markerRef.current = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
          ">
            <!-- Pulse animation -->
            <div style="
              position: absolute;
              width: 60px; 
              height: 60px; 
              background: rgba(34, 197, 94, 0.3);
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
            
            <!-- Ana marker -->
            <div style="
              width: 48px; 
              height: 48px; 
              background: linear-gradient(135deg, #22c55e, #16a34a);
              border-radius: 50% 50% 50% 0;
              border: 4px solid white; 
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-size: 18px; 
              font-weight: bold;
              transform: rotate(-45deg);
              position: relative;
              z-index: 10;
            ">
              <div style="transform: rotate(45deg); text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">
                📍
              </div>
            </div>
          </div>
          
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(1.3); opacity: 0; }
            }
          </style>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 60]
      })
    }).addTo(mapRef.current)

    // Marker'a animasyon efekti ekle
    setTimeout(() => {
      if (markerRef.current) {
        const element = markerRef.current.getElement()
        if (element) {
          element.style.animation = 'bounceIn 0.8s ease-out'
        }
      }
    }, 100)
  }

  const getReverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=tr&zoom=18`
      )
      const data = await response.json()
      
      const locationData: LocationData = {
        lat,
        lng,
        address: data.display_name || 'Adres bulunamadı',
        name: data.name || data.address?.amenity || data.address?.shop || '',
        details: {
          road: data.address?.road,
          neighbourhood: data.address?.neighbourhood || data.address?.suburb,
          suburb: data.address?.suburb || data.address?.quarter,
          city: data.address?.city || data.address?.town || data.address?.municipality,
          country: data.address?.country
        }
      }
      
      setSelectedLocation(locationData)
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      setSelectedLocation({
        lat,
        lng,
        address: 'Adres alınamadı',
        details: {}
      })
    }
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true, // GPS kullanarak daha doğru konum al
        timeout: 15000, // 15 saniye bekle
        maximumAge: 300000 // Son 5 dakika içindeki konum önbelleğini kabul et
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          console.log('Gerçek konum alındı:', { lat, lng, accuracy: position.coords.accuracy })
          
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 16)
            addMarker(lat, lng)
          }
          
          getReverseGeocode(lat, lng)
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Konum alınamadı:', error)
          setIsGettingLocation(false)
          
          let errorMessage = 'Konum alınamadı. '
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Konum izni verilmedi. Tarayıcı ayarlarından konum iznini açın.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Konum bilgisi mevcut değil.'
              break
            case error.TIMEOUT:
              errorMessage += 'Konum alma zaman aşımına uğradı.'
              break
            default:
              errorMessage += 'Bilinmeyen hata oluştu.'
              break
          }
          alert(errorMessage)
        },
        options
      )
    } else {
      setIsGettingLocation(false)
      alert('Tarayıcınız konum özelliğini desteklemiyor.')
    }
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base sm:text-xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="hidden sm:inline">📍 Konum Seçici</span>
              <span className="sm:hidden">📍 Konum</span>
            </h1>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Konumumu Al Butonu */}
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-1 sm:space-x-2 border border-white/20 hover:scale-105"
              >
                <Navigation className={`h-3 w-3 sm:h-4 sm:w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  {isGettingLocation ? 'Alınıyor...' : 'Konumum'}
                </span>
              </button>

              {/* İptal Butonu */}
              <button
                onClick={onCancel}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/30 transition-all font-medium flex items-center space-x-1 sm:space-x-2 border border-white/20 hover:scale-105"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">İptal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Harita */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-16 sm:pt-20">
        <div className="h-full p-3 sm:p-6">
          <div className="h-full bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div 
              ref={mapContainerRef} 
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Seçilen Konum Bilgisi */}
      {selectedLocation && (
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 z-[1000]">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 max-w-md mx-auto">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                  {selectedLocation.name || 'Seçilen Konum'}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                  {selectedLocation.address}
                </p>
                <div className="text-xs text-gray-500 space-y-1 sm:space-y-2">
                  {selectedLocation.details?.road && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">🛣️</span>
                      <span className="truncate">{selectedLocation.details.road}</span>
                    </div>
                  )}
                  {selectedLocation.details?.neighbourhood && (
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-500">🏘️</span>
                      <span className="truncate">{selectedLocation.details.neighbourhood}</span>
                    </div>
                  )}
                  {selectedLocation.details?.city && (
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-500">🏙️</span>
                      <span className="truncate">{selectedLocation.details.city}</span>
                    </div>
                  )}
                  <div className="mt-2 sm:mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="text-blue-700 font-medium text-xs">
                      📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold text-sm sm:text-lg flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Check className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>✅ Bu Konumu Seç</span>
              </button>
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex items-center justify-center space-x-2 hover:scale-105 text-sm sm:text-base"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Değiştir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yardım Metni */}
      {!selectedLocation && (
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 z-[1000] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 max-w-xs sm:max-w-sm mx-auto text-center">
            <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🗺️</div>
            <div className="text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              <strong>Harita üzerinde tıklayarak</strong> konum seçin
            </div>
            <div className="text-gray-500 text-xs">
              📍 veya <strong>&quot;Konumum&quot;</strong> butonunu kullanın
            </div>
          </div>
        </div>
      )}

      {/* CSS Animasyonları */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0) scale(1);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0) scale(1.1);
          }
          70% {
            transform: translate3d(0,-4px,0) scale(1.05);
          }
          90% {
            transform: translate3d(0,-2px,0) scale(1.02);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translate3d(0, 0, 0);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translate3d(0, 0, 0);
          }
          70% {
            transform: scale(0.9) translate3d(0, 0, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  )
} 