import { ParkingLot, ParkingStatus } from '@/types/parking';
import { isParkingOpen } from '@/utils/openingHours';
import { calculateOccupancyPercentage } from '@/lib/utils';
import { APP_CONFIG } from '@/constants/app';

/**
 * Otopark durumunu çalışma saatlerine göre günceller
 */
export const updateParkingStatusByHours = (lot: ParkingLot, currentDate: Date = new Date()): ParkingStatus => {
  // Eğer otopark çalışma saatleri dışındaysa kapalı yap
  if (!isParkingOpen(lot.openingHours, currentDate)) {
    return ParkingStatus.CLOSED;
  }

  // Manuel durumları koru (kapalı)
  if (lot.status === ParkingStatus.CLOSED) {
    return lot.status;
  }

  // Doluluk oranına göre durum belirle
  const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces);
  
  if (occupancyPercentage >= APP_CONFIG.OCCUPANCY_THRESHOLDS.OCCUPIED) {
    return ParkingStatus.OCCUPIED;
  }
  
  if (occupancyPercentage >= APP_CONFIG.OCCUPANCY_THRESHOLDS.FULL) {
    return ParkingStatus.NEARLY_FULL;
  }
  
  return ParkingStatus.AVAILABLE;
};

/**
 * Tüm otoparkların durumlarını günceller
 */
export const updateAllParkingStatuses = (lots: ParkingLot[], currentDate: Date = new Date()): ParkingLot[] => {
  return lots.map(lot => {
    const newStatus = updateParkingStatusByHours(lot, currentDate);
    
    // Kapalı otoparkların doluluk oranını 0 yap
    const occupiedSpaces = newStatus === ParkingStatus.CLOSED ? 0 : lot.occupiedSpaces;
    
    return {
      ...lot,
      status: newStatus,
      occupiedSpaces
    };
  });
};
