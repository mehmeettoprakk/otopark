import { OpeningHours } from '@/types/parking';

/**
 * Günün adlarını index'e göre döndürür
 */
const DAY_NAMES: (keyof OpeningHours)[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

/**
 * HH:MM formatındaki zamanı dakikaya çevirir
 */
export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Dakikayı HH:MM formatına çevirir
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Otopark şu an açık mı kontrol eder
 */
export const isParkingOpen = (openingHours: OpeningHours, date: Date = new Date()): boolean => {
  const dayIndex = date.getDay();
  const currentDay = DAY_NAMES[dayIndex];
  const daySchedule = openingHours[currentDay];

  if (!daySchedule.isOpen) {
    return false;
  }

  const currentTimeMinutes = date.getHours() * 60 + date.getMinutes();
  const openTimeMinutes = timeToMinutes(daySchedule.openTime);
  const closeTimeMinutes = timeToMinutes(daySchedule.closeTime);

  // Gece yarısını geçen saatler için (örn: 22:00-02:00)
  if (closeTimeMinutes < openTimeMinutes) {
    return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes <= closeTimeMinutes;
  }

  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
};

/**
 * Otoparkın bir sonraki açılış zamanını bulur
 */
export const getNextOpeningTime = (openingHours: OpeningHours, date: Date = new Date()): Date | null => {
  const currentDate = new Date(date);
  
  // 7 gün boyunca kontrol et
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(currentDate.getDate() + i);
    
    const dayIndex = checkDate.getDay();
    const dayName = DAY_NAMES[dayIndex];
    const daySchedule = openingHours[dayName];
    
    if (daySchedule.isOpen) {
      const [hours, minutes] = daySchedule.openTime.split(':').map(Number);
      const openingTime = new Date(checkDate);
      openingTime.setHours(hours, minutes, 0, 0);
      
      // Eğer aynı gün ve henüz açılış saati geçmediyse
      if (i === 0 && openingTime > date) {
        return openingTime;
      }
      // Farklı bir gün ise
      if (i > 0) {
        return openingTime;
      }
    }
  }
  
  return null; // 7 gün içinde açık gün yok
};

/**
 * Otoparkın kapanmasına kalan süreyi dakika olarak döndürür
 */
export const getTimeUntilClosing = (openingHours: OpeningHours, date: Date = new Date()): number | null => {
  if (!isParkingOpen(openingHours, date)) {
    return null;
  }
  
  const dayIndex = date.getDay();
  const currentDay = DAY_NAMES[dayIndex];
  const daySchedule = openingHours[currentDay];
  
  const currentTimeMinutes = date.getHours() * 60 + date.getMinutes();
  const closeTimeMinutes = timeToMinutes(daySchedule.closeTime);
  const openTimeMinutes = timeToMinutes(daySchedule.openTime);
  
  // Gece yarısını geçen saatler için
  if (closeTimeMinutes < openTimeMinutes) {
    if (currentTimeMinutes >= openTimeMinutes) {
      // Bugün gece yarısına kadar + yarın kapanış saatine kadar
      return (24 * 60 - currentTimeMinutes) + closeTimeMinutes;
    } else {
      // Bugün kapanış saatine kadar
      return closeTimeMinutes - currentTimeMinutes;
    }
  }
  
  return closeTimeMinutes - currentTimeMinutes;
};

/**
 * Varsayılan çalışma saatleri döndürür
 */
export const getDefaultOpeningHours = (): OpeningHours => ({
  monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
  saturday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
  sunday: { isOpen: false, openTime: '08:00', closeTime: '18:00' }
});
