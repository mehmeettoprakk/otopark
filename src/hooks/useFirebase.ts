import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, push, set, update, remove, off } from 'firebase/database';
import { ParkingLot, ParkingSpace, ParkingStatus } from '@/types/parking';
import { FEATURES } from '@/constants/app';

export function useParkingLots() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parkingLotsRef = ref(database, 'parkingLots');
    
    const unsubscribe = onValue(parkingLotsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const lots: ParkingLot[] = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setParkingLots(lots);
        } else {
          setParkingLots([]);
        }
        setLoading(false);
        setError(null); // Clear any previous errors
      } catch {
        setError('Otopark verileri yüklenirken hata oluştu');
        setLoading(false);
      }
    }, (error) => {
      // Firebase database error'larını sessiz handle et
      if (FEATURES.ENABLE_DEBUG_LOGGING) {
        console.warn('Firebase Database permission denied:', error.message);
      }
      setError('Firebase bağlantısı gerekiyor. Lütfen projeyi yapılandırın.');
      setLoading(false);
    });

    return () => off(parkingLotsRef, 'value', unsubscribe);
  }, []);

  const addParkingLot = async (parkingLot: Omit<ParkingLot, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const parkingLotsRef = ref(database, 'parkingLots');
      const newLotRef = push(parkingLotsRef);
      
      // Varsayılan değerleri ayarla
      const lotWithDefaults = {
        ...parkingLot,
        status: parkingLot.status || ParkingStatus.AVAILABLE, // Eğer status belirtilmemişse 'available' yap
        totalSpaces: parkingLot.totalSpaces || 0,
        occupiedSpaces: parkingLot.occupiedSpaces || 0,
        hourlyRate: parkingLot.hourlyRate || 0,
        isActive: parkingLot.isActive !== undefined ? parkingLot.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newLotRef, lotWithDefaults);
      return newLotRef.key;
    } catch {
      throw new Error('Otopark eklenirken hata oluştu');
    }
  };

  const updateParkingLot = async (id: string, updates: Partial<ParkingLot>) => {
    try {
      const lotRef = ref(database, `parkingLots/${id}`);
      await update(lotRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch {
      throw new Error('Otopark güncellenirken hata oluştu');
    }
  };

  const deleteParkingLot = async (id: string) => {
    try {
      const lotRef = ref(database, `parkingLots/${id}`);
      await remove(lotRef);
    } catch {
      throw new Error('Otopark silinirken hata oluştu');
    }
  };

  return {
    parkingLots,
    loading,
    error,
    addParkingLot,
    updateParkingLot,
    deleteParkingLot
  };
}

export function useParkingSpaces(parkingLotId: string) {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parkingLotId) return;

    const spacesRef = ref(database, `parkingSpaces/${parkingLotId}`);
    
    const unsubscribe = onValue(spacesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const spacesList: ParkingSpace[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setSpaces(spacesList);
      } else {
        setSpaces([]);
      }
      setLoading(false);
    }, (error) => {
      // Firebase database error'larını sessiz handle et
      if (FEATURES.ENABLE_DEBUG_LOGGING) {
        console.warn('Firebase Database spaces permission denied:', error.message);
      }
      setSpaces([]);
      setLoading(false);
    });

    return () => off(spacesRef, 'value', unsubscribe);
  }, [parkingLotId]);

  const updateSpaceOccupancy = async (spaceId: string, isOccupied: boolean, vehicleLicensePlate?: string) => {
    try {
      const spaceRef = ref(database, `parkingSpaces/${parkingLotId}/${spaceId}`);
      await update(spaceRef, {
        isOccupied,
        vehicleLicensePlate: isOccupied ? vehicleLicensePlate : null,
        entryTime: isOccupied ? new Date().toISOString() : null,
        exitTime: !isOccupied ? new Date().toISOString() : null
      });

      // Otopark doluluk oranını güncelle
      const occupiedCount = spaces.filter(s => s.isOccupied).length + (isOccupied ? 1 : -1);
      const lotRef = ref(database, `parkingLots/${parkingLotId}`);
      await update(lotRef, {
        occupiedSpaces: occupiedCount,
        updatedAt: new Date().toISOString()
      });
    } catch {
      throw new Error('Park alanı durumu güncellenirken hata oluştu');
    }
  };

  return {
    spaces,
    loading,
    updateSpaceOccupancy
  };
} 