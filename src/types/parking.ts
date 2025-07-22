export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpaces: number;
  occupiedSpaces: number;
  hourlyRate: number;
  isActive: boolean;
  status: ParkingStatus;
  openingHours: OpeningHours;
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
}

export enum ParkingStatus {
  AVAILABLE = 'available',    // Müsait
  NEARLY_FULL = 'nearly_full', // Dolmak Üzere
  OCCUPIED = 'occupied',      // Dolu
  MAINTENANCE = 'maintenance', // Bakım
  CLOSED = 'closed',          // Kapalı
  RESERVED = 'reserved'       // Rezerve
}

export interface ParkingSpace {
  id: string;
  parkingLotId: string;
  spaceNumber: string;
  isOccupied: boolean;
  vehicleLicensePlate?: string;
  entryTime?: string;
  exitTime?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator';
  parkingLotIds?: string[];
}

export interface ParkingSession {
  id: string;
  parkingLotId: string;
  spaceId: string;
  vehicleLicensePlate: string;
  entryTime: string;
  exitTime?: string;
  totalFee?: number;
  status: 'active' | 'completed';
}

export interface MapLocation {
  latitude: number;
  longitude: number;
  zoom?: number;
} 