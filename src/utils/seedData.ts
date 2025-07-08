import { database } from '@/lib/firebase'
import { ref, set } from 'firebase/database'

// İstanbul'daki demo otopark verileri
export const demoData = {
  parkingLots: {
    'parking-1': {
      name: 'Taksim Meydanı Otoparkı',
      address: 'Taksim Meydanı, Beyoğlu/İstanbul',
      latitude: 41.0369,
      longitude: 28.9852,
      totalSpaces: 150,
      occupiedSpaces: 120,
      hourlyRate: 25,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-2': {
      name: 'Eminönü Kapalı Otoparkı',
      address: 'Eminönü, Fatih/İstanbul',
      latitude: 41.0168,
      longitude: 28.9722,
      totalSpaces: 200,
      occupiedSpaces: 45,
      hourlyRate: 20,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'parking-3': {
      name: 'Beşiktaş İskelesi Otoparkı',
      address: 'Beşiktaş İskelesi, Beşiktaş/İstanbul',
      latitude: 41.0422,
      longitude: 29.0081,
      totalSpaces: 80,
      occupiedSpaces: 75,
      hourlyRate: 30,
      isActive: true,
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
      isActive: true,
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
    'parking-6': generateParkingSpaces('parking-6', 500, 425)
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Demo verileri ekleniyor...')
    }
    
    // Otopark verilerini ekle
    const parkingLotsRef = ref(database, 'parkingLots')
    await set(parkingLotsRef, demoData.parkingLots)
    
    // Park yeri verilerini ekle
    const parkingSpacesRef = ref(database, 'parkingSpaces')
    await set(parkingSpacesRef, demoData.parkingSpaces)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Demo verileri başarıyla eklendi!')
    }
    return true
  } catch (error) {
    // Error'ları sadece development modunda göster
    if (process.env.NODE_ENV === 'development') {
      console.warn('Demo verileri eklenirken hata oluştu:', error)
    }
    return false
  }
}

// Rastgele doluluk güncellemesi için
export function simulateOccupancyChanges() {
  setInterval(async () => {
    const parkingLotIds = Object.keys(demoData.parkingLots)
    const randomLotId = parkingLotIds[Math.floor(Math.random() * parkingLotIds.length)]
    const lot = demoData.parkingLots[randomLotId as keyof typeof demoData.parkingLots]
    
    // Rastgele +/- 5 arası değişim
    const change = Math.floor(Math.random() * 11) - 5
    const newOccupied = Math.max(0, Math.min(lot.totalSpaces, lot.occupiedSpaces + change))
    
    if (newOccupied !== lot.occupiedSpaces) {
      try {
        const lotRef = ref(database, `parkingLots/${randomLotId}`)
        await set(lotRef, {
          ...lot,
          occupiedSpaces: newOccupied,
          updatedAt: new Date().toISOString()
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${lot.name} doluluk güncellendi: ${newOccupied}/${lot.totalSpaces}`)
        }
      } catch (error) {
        // Simulation error'larını sessiz handle et
        if (process.env.NODE_ENV === 'development') {
          console.warn('Doluluk güncellenirken hata:', error)
        }
      }
    }
  }, 10000) // Her 10 saniyede bir güncelle
} 