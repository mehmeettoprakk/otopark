'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapLocation, ParkingLot, ParkingStatus } from '@/types/parking'
import { calculateOccupancyPercentage } from '@/lib/utils'

// Leaflet marker icon sorunu için fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LeafletMapProps {
  center: MapLocation
  parkingLots: ParkingLot[]
  onParkingLotClick?: (lot: ParkingLot) => void
  userLocation?: MapLocation
  height?: string
  focusLocation?: { latitude: number; longitude: number } | null
}

// Durum bazlı renk ve emoji
const getStatusStyle = (status: ParkingStatus, occupancy: number) => {
  switch (status) {
    case ParkingStatus.AVAILABLE:
      if (occupancy < 50) return { color: '#10b981', bg: '#d1fae5', emoji: '🟢', text: 'Müsait' }
      if (occupancy < 80) return { color: '#f59e0b', bg: '#fef3c7', emoji: '🟡', text: 'Dolmak Üzere' }
      return { color: '#ef4444', bg: '#fee2e2', emoji: '🔴', text: 'Neredeyse Dolu' }
    case ParkingStatus.OCCUPIED:
      return { color: '#ef4444', bg: '#fee2e2', emoji: '🔴', text: 'Dolu' }
    case ParkingStatus.MAINTENANCE:
      return { color: '#8b5cf6', bg: '#e9d5ff', emoji: '🔧', text: 'Bakımda' }
    case ParkingStatus.CLOSED:
      return { color: '#6b7280', bg: '#f3f4f6', emoji: '🚫', text: 'Kapalı' }
    case ParkingStatus.RESERVED:
      return { color: '#3b82f6', bg: '#dbeafe', emoji: '🅿️', text: 'Rezerve' }
    default:
      return { color: '#10b981', bg: '#d1fae5', emoji: '🟢', text: 'Müsait' }
  }
}

export default function LeafletMap({ 
  center, 
  parkingLots, 
  onParkingLotClick, 
  userLocation,
  height = '400px',
  focusLocation
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Haritayı initialize et
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 60,
      wheelPxPerZoomLevel: 60,
    }).setView(
      [center.latitude, center.longitude],
      center.zoom || 13
    )

    // Özel zoom control ekle
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapRef.current)

    // Attributions ekle
    L.control.attribution({
      position: 'bottomleft',
      prefix: '<a href="https://leafletjs.com" target="_blank">Leaflet</a>'
    }).addTo(mapRef.current)

    // Daha güzel tile layer - CartoDB Positron
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current)

    // Harita stili
    mapRef.current.getContainer().style.borderRadius = '16px'
    mapRef.current.getContainer().style.overflow = 'hidden'
    mapRef.current.getContainer().style.background = 'linear-gradient(135deg, #f0f9ff, #e0e7ff, #fdf2f8)'

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center])

  // Odaklanma efekti - otopark kartına tıklandığında çalışır
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return

    // Haritayı seçilen otoparka odakla - smooth animasyon ile
    mapRef.current.flyTo([focusLocation.latitude, focusLocation.longitude], 16, {
      duration: 1.5,
      easeLinearity: 0.25
    })
  }, [focusLocation])

  useEffect(() => {
    if (!mapRef.current) return

    // Önceki marker'ları temizle
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Kullanıcı konumu marker'ı - daha güzel tasarım
    if (userLocation) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <!-- Pulse animation -->
              <div style="
                position: absolute;
                width: 40px; 
                height: 40px; 
                background: rgba(59, 130, 246, 0.3);
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
              
              <!-- Inner circle -->
            <div style="
                width: 20px; 
                height: 20px; 
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border: 3px solid white;
              border-radius: 50%; 
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                position: relative;
                z-index: 10;
            "></div>
              
              <!-- GPS Icon -->
              <div style="
                position: absolute;
                color: white;
                font-size: 10px;
                font-weight: bold;
                z-index: 11;
              ">📍</div>
            </div>
            
            <style>
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
              }
            </style>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      }).addTo(mapRef.current!)
      
      markersRef.current.push(userMarker)
    }

    // Otopark marker'ları - çok daha güzel tasarım
    parkingLots.forEach(lot => {
      const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
      const statusStyle = getStatusStyle(lot.status, occupancyPercentage)

      const marker = L.marker([lot.latitude, lot.longitude], {
        icon: L.divIcon({
          className: 'parking-marker',
          html: `
            <div style="
              display: flex; 
              flex-direction: column; 
              align-items: center;
              filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
            ">
              <!-- Ana marker -->
              <div style="
                width: 50px; 
                height: 50px; 
                background: linear-gradient(135deg, ${statusStyle.color}, ${statusStyle.color}dd);
                border-radius: 50%; 
                border: 4px solid white; 
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                display: flex; 
                align-items: center; 
                justify-content: center; 
                position: relative;
                transition: all 0.3s ease;
              " 
              onmouseover="this.style.transform='scale(1.1)'" 
              onmouseout="this.style.transform='scale(1)'">
                
                <!-- Ana ikon -->
                <div style="
                color: white; 
                  font-size: 18px; 
                  font-weight: bold;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                ">
                  ${statusStyle.emoji}
                </div>
                
                <!-- Durumu göster -->
                <div style="
                  position: absolute;
                  top: -8px;
                  right: -8px;
                  width: 20px;
                  height: 20px;
                  background: ${statusStyle.bg};
                  border: 2px solid ${statusStyle.color};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                font-weight: bold;
                  color: ${statusStyle.color};
                ">
                  ${lot.status === ParkingStatus.AVAILABLE ? (lot.totalSpaces - lot.occupiedSpaces) : 
                    lot.status === ParkingStatus.OCCUPIED ? '!' : 
                    lot.status === ParkingStatus.MAINTENANCE ? '🔧' : 
                    lot.status === ParkingStatus.CLOSED ? '❌' : '🅿️'}
                </div>
              </div>
              
              <!-- Bilgi kartı -->
              <div style="
                background: white; 
                padding: 8px 12px; 
                border-radius: 12px; 
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin-top: 8px; 
                white-space: nowrap;
                border: 2px solid ${statusStyle.color};
                position: relative;
              ">
                <!-- Üçgen pointer -->
                <div style="
                  position: absolute;
                  top: -8px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 8px solid transparent;
                  border-right: 8px solid transparent;
                  border-bottom: 8px solid ${statusStyle.color};
                "></div>
                
                <!-- İçerik -->
                <div style="
                  font-size: 12px; 
                  font-weight: 600; 
                  color: ${statusStyle.color};
                  margin-bottom: 2px;
              ">
                  ${lot.name}
                </div>
                
                <div style="
                  font-size: 11px; 
                  color: #6b7280;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                ">
                  <span style="
                    background: ${statusStyle.bg};
                    color: ${statusStyle.color};
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-weight: bold;
                  ">
                    ${statusStyle.text}
                  </span>
                  
                  ${lot.status === ParkingStatus.AVAILABLE ? 
                    `<span>💰 ${lot.hourlyRate}₺/saat</span>` : 
                    lot.status === ParkingStatus.OCCUPIED ? 
                    `<span>🚫 Dolu</span>` : 
                    lot.status === ParkingStatus.MAINTENANCE ? 
                    `<span>⏰ Bakım</span>` : 
                    lot.status === ParkingStatus.CLOSED ? 
                    `<span>🚫 Kapalı</span>` : 
                    `<span>🔒 Rezerve</span>`}
                </div>
              </div>
            </div>
          `,
          iconSize: [80, 100],
          iconAnchor: [40, 90]
        })
      }).addTo(mapRef.current!)

      // Gelişmiş popup
      const popupContent = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 300px;
          padding: 16px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          ">
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, ${statusStyle.color}, ${statusStyle.color}dd);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">
              ${statusStyle.emoji}
            </div>
            <div>
              <h3 style="
                margin: 0;
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
              ">${lot.name}</h3>
              <p style="
                margin: 0;
                font-size: 12px;
                color: #6b7280;
                margin-top: 2px;
              ">${lot.address}</p>
            </div>
          </div>
          
          <div style="
            background: ${statusStyle.bg};
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-weight: 600;
              color: ${statusStyle.color};
              margin-bottom: 6px;
            ">
              ${statusStyle.emoji} ${statusStyle.text}
            </div>
            
            ${lot.status === ParkingStatus.AVAILABLE ? `
              <div style="display: flex; justify-content: space-between; font-size: 14px;">
                <span><strong>Boş:</strong> ${lot.totalSpaces - lot.occupiedSpaces}/${lot.totalSpaces}</span>
                <span><strong>Doluluk:</strong> %${occupancyPercentage}</span>
              </div>
              <div style="margin-top: 4px; font-size: 14px;">
                <span><strong>Saatlik Ücret:</strong> ${lot.hourlyRate} ₺</span>
              </div>
            ` : lot.status === ParkingStatus.OCCUPIED ? `
              <div style="font-size: 14px; text-align: center;">
                <strong>Hiç boş yer yok!</strong>
              </div>
            ` : lot.status === ParkingStatus.MAINTENANCE ? `
              <div style="font-size: 14px; text-align: center;">
                <strong>Geçici olarak bakımda</strong>
              </div>
            ` : lot.status === ParkingStatus.CLOSED ? `
              <div style="font-size: 14px; text-align: center;">
                <strong>Şu an kapalı</strong>
              </div>
            ` : `
              <div style="font-size: 14px; text-align: center;">
                <strong>Rezerve edilmiş</strong>
              </div>
            `}
          </div>
          
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}', '_blank')" 
                  style="
                    width: 100%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                  "
                  onmouseover="this.style.transform='scale(1.02)'"
                  onmouseout="this.style.transform='scale(1)'">
            🗺️ Yol Tarifi Al
          </button>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      // Click event
      if (onParkingLotClick) {
        marker.on('click', () => onParkingLotClick(lot))
      }

      markersRef.current.push(marker)
    })

    // Özel popup stilleri
    const style = document.createElement('style')
    style.textContent = `
      .custom-popup .leaflet-popup-content-wrapper {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid #e5e7eb;
        padding: 0;
      }
      .custom-popup .leaflet-popup-content {
        margin: 0;
        line-height: 1.4;
      }
      .custom-popup .leaflet-popup-tip {
        background: white;
        border: 1px solid #e5e7eb;
        border-top: none;
        border-right: none;
      }
      .custom-popup .leaflet-popup-close-button {
        color: #6b7280;
        font-size: 18px;
        line-height: 1;
        padding: 8px;
      }
      .custom-popup .leaflet-popup-close-button:hover {
        color: #ef4444;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [parkingLots, userLocation, onParkingLotClick])

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: height === 'responsive' ? undefined : height === '100%' ? '100%' : height
      }}
      className={`w-full z-0 ${
        height === 'responsive' 
          ? 'h-[300px] sm:h-[400px] lg:h-[650px]' 
          : height === 'large'
          ? 'h-[400px] sm:h-[500px] lg:h-[800px]'
          : height === '100%'
          ? 'h-full'
          : ''
      }`}
    />
  )
} 