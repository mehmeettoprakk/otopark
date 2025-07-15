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
      zoomControl: false // Zoom kontrollerini özelleştireceğiz
    }).setView(defaultCenter as [number, number], initialLocation ? 13 : 6)

    // Tile layer ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current)

    // Zoom kontrollerini sağ alta ekle
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapRef.current)

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

    // Yeni marker ekle
    markerRef.current = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px; 
            height: 40px; 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 50% 50% 50% 0;
            border: 3px solid white; 
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-size: 16px; 
            font-weight: bold;
            transform: rotate(-45deg);
            position: relative;
          ">
            <div style="transform: rotate(45deg);">📍</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(mapRef.current)

    // Marker'a animasyon efekti ekle
    setTimeout(() => {
      if (markerRef.current) {
        const element = markerRef.current.getElement()
        if (element) {
          element.style.animation = 'bounce 0.6s ease-out'
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
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-lg">
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-blue-800 flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>📍 Konum Seçici</span>
            </h1>
            
            <div className="flex items-center space-x-3">
              {/* Konumumu Al Butonu */}
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
              >
                <Navigation className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap">
                  {isGettingLocation ? 'Alınıyor...' : 'Konumumu Al'}
                </span>
              </button>

              {/* İptal Butonu */}
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>İptal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Harita */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full pt-20"
        style={{ minHeight: '100vh' }}
      />

      {/* Seçilen Konum Bilgisi */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-6 right-6 z-[1000]">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {selectedLocation.name || 'Seçilen Konum'}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {selectedLocation.address}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  {selectedLocation.details?.road && (
                    <div>🛣️ {selectedLocation.details.road}</div>
                  )}
                  {selectedLocation.details?.neighbourhood && (
                    <div>🏘️ {selectedLocation.details.neighbourhood}</div>
                  )}
                  {selectedLocation.details?.city && (
                    <div>🏙️ {selectedLocation.details.city}</div>
                  )}
                  <div className="mt-2 text-blue-600">
                    📍 {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-500 text-white py-4 px-6 rounded-xl hover:bg-green-600 transition-colors font-bold text-lg flex items-center justify-center space-x-3 shadow-lg"
              >
                <Check className="h-6 w-6" />
                <span>✅ Bu Konumu Seç</span>
              </button>
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-4 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
              >
                <X className="h-5 w-5" />
                <span>Değiştir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yardım Metni */}
      {!selectedLocation && (
        <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm mx-auto text-center">
            <div className="text-gray-600 text-sm">
              🗺️ <strong>Harita üzerinde tıklayarak</strong> konum seçin<br/>
              📍 veya yukarıdan <strong>&quot;Konumumu Al&quot;</strong> butonunu kullanın
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
      `}</style>
    </div>
  )
} 