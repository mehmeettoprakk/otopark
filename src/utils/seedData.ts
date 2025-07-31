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
      openingHours: {
        monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        friday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '18:00' }
      },
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
      openingHours: {
        monday: { isOpen: true, openTime: '07:30', closeTime: '21:00' },
        tuesday: { isOpen: true, openTime: '07:30', closeTime: '21:00' },
        wednesday: { isOpen: true, openTime: '07:30', closeTime: '21:00' },
        thursday: { isOpen: true, openTime: '07:30', closeTime: '21:00' },
        friday: { isOpen: true, openTime: '07:30', closeTime: '23:00' },
        saturday: { isOpen: true, openTime: '08:00', closeTime: '23:00' },
        sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' }
      },
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
      openingHours: {
        monday: { isOpen: true, openTime: '06:00', closeTime: '24:00' },
        tuesday: { isOpen: true, openTime: '06:00', closeTime: '24:00' },
        wednesday: { isOpen: true, openTime: '06:00', closeTime: '24:00' },
        thursday: { isOpen: true, openTime: '06:00', closeTime: '24:00' },
        friday: { isOpen: true, openTime: '06:00', closeTime: '24:00' },
        saturday: { isOpen: true, openTime: '06:00', closeTime: '24:00' },
        sunday: { isOpen: true, openTime: '08:00', closeTime: '22:00' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-4': {
      name: 'Çeşmeli Otoparkı',
      address: 'Karaoğlan, Çatal Sk., 10010 Balıkesir Merkez/Balıkesir',
      latitude: 39.6498,
      longitude: 27.8789,
      totalSpaces: 120,
      occupiedSpaces: 30,
      hourlyRate: 22,
      isActive: true,
      status: 'available',
      openingHours: {
        monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        friday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '18:00' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-5': {
      name: 'Levent Otopark',
      address: 'Hacı İlbey, 9006 Sokak No 16, 10100 Altıeylül/Balıkesir',
      latitude: 39.6446,
      longitude: 27.8772,
      totalSpaces: 300,
      occupiedSpaces: 180,
      hourlyRate: 35,
      isActive: false,
      status: 'maintenance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-6': {
      name: 'Han Otopark',
      address: 'Gümüsçesme, 184. Sk. 18-20, 10040 Balıkesir Merkez/Balıkesir',
      latitude: 39.6522,
      longitude: 27.9170,
      totalSpaces: 500,
      occupiedSpaces: 425,
      hourlyRate: 15,
      isActive: true,
      status: 'nearly_full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-7': {
      name: 'Kef Vale Otopark',
      address: 'Dumlupınar, Alanlar Sk. No:11, 10010 Karesi/Balıkesir',
      latitude: 39.6469,
      longitude: 27.8800,
      totalSpaces: 100,
      occupiedSpaces: 0,
      hourlyRate: 18,
      isActive: false,
      status: 'closed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-8': {
      name: '3 Katlı Oto Park Harun Erol',
      address: 'Yıldırım, Paşasaray Sk., 10010 Balıkesir Merkez/Balıkesir',
      latitude: 39.6488,
      longitude: 27.8843,
      totalSpaces: 150,
      occupiedSpaces: 120,
      hourlyRate: 20,
      isActive: true,
      status: 'reserved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-9': {
      name: 'Balpark Balıkesir Otopark İşletmeleri',
      address: 'Karesi, Alankuyu Sk. 1 B, 10010 Karesi/Balıkesir',
      latitude: 39.6500,
      longitude: 27.8804,
      totalSpaces: 250,
      occupiedSpaces: 80,
      hourlyRate: 40,
      isActive: true,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-10': {
      name: 'MAY-WAX OTOPARK',
      address: 'Altı Eylül, Atalar Cd. No:76, 10100 Altıeylül/Balıkesir',
      latitude: 39.6431,
      longitude: 27.8817,
      totalSpaces: 90,
      occupiedSpaces: 75,
      hourlyRate: 35,
      isActive: true,
      status: 'nearly_full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-11': {
      name: 'Özel Nev Balıkesir Hastanesi Otoparkı',
      address: 'Paşa Alanı, 128. Sk. No:1, 10020 Balıkesir Merkez/Balıkesir',
      latitude: 39.6675,
      longitude: 27.9090,
      totalSpaces: 120,
      occupiedSpaces: 45,
      hourlyRate: 30,
      isActive: true,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-12': {
      name: '1 Nolu Katlı Otopark',
      address: 'Hisariçi, 10100 Balıkesir Merkez/Balıkesir',
      latitude: 39.6508,
      longitude: 27.8816,
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
