import { database } from '@/lib/firebase'
import { ref, set } from 'firebase/database'
import { FEATURES } from '@/constants/app'

// İstanbul'daki demo otopark verileri
export const demoData = {
  parkingLots: {
    'parking-1': {
      name: 'Balıkesir Belediyesi Katlı Otoparkı',
      address: 'Altıeylül, Çiğdem Sk., 10100 Balıkesir Merkez/Balıkesir',
      latitude: 39.6455,
      longitude: 27.8826,
      totalSpaces: 150,
      occupiedSpaces: 120,
      hourlyRate: 25,
      isActive: true,
      status: 'nearly_full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-2': {
      name: 'Berfin Otopark',
      address: 'Altı Eylül, Çiğdem Sk., 10100 Balıkesir Merkez/Balıkesir',
      latitude: 39.6431,
      longitude: 27.8829,
      totalSpaces: 200,
      occupiedSpaces: 160,
      hourlyRate: 20,
      isActive: true,
      status: 'nearly_full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-3': {
      name: 'BalVale Merkez Otopark',
      address: 'Eski Kuyumcular, Iştınlı Sk. No:4/1, 10100 Karesi/Balıkesir',
      latitude: 39.6464,
      longitude: 27.8814,
      totalSpaces: 80,
      occupiedSpaces: 75,
      hourlyRate: 30,
      isActive: true,
      status: 'nearly_full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-4': {
      name: 'Kadıköy Rıhtım Otoparkı',
      address: 'Kadıköy Rıhtımı, Kadıköy/İstanbul',
      latitude: 40.9906,
      longitude: 29.0275,
      totalSpaces: 120,
      occupiedSpaces: 30,
      hourlyRate: 22,
      isActive: true,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-5': {
      name: 'Levent Metro Otoparkı',
      address: 'Levent, Beşiktaş/İstanbul',
      latitude: 41.0814,
      longitude: 29.0092,
      totalSpaces: 300,
      occupiedSpaces: 180,
      hourlyRate: 35,
      isActive: false,
      status: 'maintenance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-6': {
      name: 'Şişli Cevahir AVM Otoparkı',
      address: 'Şişli, İstanbul',
      latitude: 41.0581,
      longitude: 28.9869,
      totalSpaces: 500,
      occupiedSpaces: 425,
      hourlyRate: 15,
      isActive: true,
      status: 'nearly_full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-7': {
      name: 'Üsküdar Merkez Otoparkı',
      address: 'Üsküdar Merkez, Üsküdar/İstanbul',
      latitude: 41.0276,
      longitude: 29.0194,
      totalSpaces: 100,
      occupiedSpaces: 0,
      hourlyRate: 18,
      isActive: false,
      status: 'closed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-8': {
      name: 'Bakırköy Sahil Otoparkı',
      address: 'Bakırköy Sahil, Bakırköy/İstanbul',
      latitude: 40.9723,
      longitude: 28.8732,
      totalSpaces: 150,
      occupiedSpaces: 120,
      hourlyRate: 20,
      isActive: true,
      status: 'reserved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-9': {
      name: 'Maslak Business Otoparkı',
      address: 'Maslak, Şişli/İstanbul',
      latitude: 41.1067,
      longitude: 29.0222,
      totalSpaces: 250,
      occupiedSpaces: 80,
      hourlyRate: 40,
      isActive: true,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-10': {
      name: 'Galata Tower Otoparkı',
      address: 'Galata, Beyoğlu/İstanbul',
      latitude: 41.0256,
      longitude: 28.9741,
      totalSpaces: 90,
      occupiedSpaces: 75,
      hourlyRate: 35,
      isActive: true,
      status: 'nearly_full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-11': {
      name: 'Ortaköy Mecidiye Otoparkı',
      address: 'Ortaköy, Beşiktaş/İstanbul',
      latitude: 41.0553,
      longitude: 29.0264,
      totalSpaces: 120,
      occupiedSpaces: 45,
      hourlyRate: 30,
      isActive: true,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-12': {
      name: 'Pendik Marina Otoparkı',
      address: 'Pendik Marina, Pendik/İstanbul',
      latitude: 40.8743,
      longitude: 29.2333,
      totalSpaces: 180,
      occupiedSpaces: 160,
      hourlyRate: 25,
      isActive: false,
      status: 'maintenance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  parkingSpaces: {
    'parking-1': generateParkingSpaces('parking-1', 150, 120),
    'parking-2': generateParkingSpaces('parking-2', 200, 45),
    'parking-3': generateParkingSpaces('parking-3', 80, 75),
    'parking-4': generateParkingSpaces('parking-4', 120, 30),
    'parking-5': generateParkingSpaces('parking-5', 300, 180),
    'parking-6': generateParkingSpaces('parking-6', 500, 425),
    'parking-7': generateParkingSpaces('parking-7', 100, 0),
    'parking-8': generateParkingSpaces('parking-8', 150, 120),
    'parking-9': generateParkingSpaces('parking-9', 250, 80),
    'parking-10': generateParkingSpaces('parking-10', 90, 40),
    'parking-11': generateParkingSpaces('parking-11', 120, 45),
    'parking-12': generateParkingSpaces('parking-12', 180, 160)
  }
}

function generateParkingSpaces(parkingLotId: string, totalSpaces: number, occupiedCount: number) {
  const spaces: Record<string, {
    parkingLotId: string
    spaceNumber: string
    isOccupied: boolean
    vehicleLicensePlate: string | null
    entryTime: string | null
    exitTime: string | null
  }> = {}
  
  for (let i = 1; i <= totalSpaces; i++) {
    const spaceId = `space-${i}`
    const isOccupied = i <= occupiedCount
    
    spaces[spaceId] = {
      parkingLotId,
      spaceNumber: i.toString().padStart(3, '0'),
      isOccupied,
      vehicleLicensePlate: isOccupied ? `34ABC${Math.floor(Math.random() * 900) + 100}` : null,
      entryTime: isOccupied ? new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString() : null,
      exitTime: null
    }
  }
  
  return spaces
}

export async function seedDatabase() {
  try {
    if (FEATURES.ENABLE_DEBUG_LOGGING) {
      console.log('Demo verileri ekleniyor...')
    }
    
    // Otopark verilerini ekle
    const parkingLotsRef = ref(database, 'parkingLots')
    await set(parkingLotsRef, demoData.parkingLots)
    
    // Park yeri verilerini ekle
    const parkingSpacesRef = ref(database, 'parkingSpaces')
    await set(parkingSpacesRef, demoData.parkingSpaces)
    
    if (FEATURES.ENABLE_DEBUG_LOGGING) {
      console.log('Demo verileri başarıyla eklendi!')
    }
    return true
  } catch (error) {
    // Error'ları sadece development modunda göster
    if (FEATURES.ENABLE_DEBUG_LOGGING) {
      console.warn('Demo verileri eklenirken hata oluştu:', error)
    }
    return false
  }
}
