import { useState, useEffect } from 'react';
import { OpeningHours } from '@/types/parking';
import { isParkingOpen, getNextOpeningTime, getTimeUntilClosing } from '@/utils/openingHours';

interface ParkingTimeStatus {
  isOpen: boolean;
  nextOpeningTime: Date | null;
  timeUntilClosing: number | null;
  statusMessage: string;
}

/**
 * Otopark çalışma saatleri durumunu izleyen hook
 */
export const useParkingTimeStatus = (openingHours: OpeningHours): ParkingTimeStatus => {
  const [timeStatus, setTimeStatus] = useState<ParkingTimeStatus>({
    isOpen: false,
    nextOpeningTime: null,
    timeUntilClosing: null,
    statusMessage: ''
  });

  useEffect(() => {
    const updateTimeStatus = () => {
      const now = new Date();
      const isOpen = isParkingOpen(openingHours, now);
      const nextOpeningTime = getNextOpeningTime(openingHours, now);
      const timeUntilClosing = getTimeUntilClosing(openingHours, now);

      let statusMessage = '';

      if (isOpen) {
        if (timeUntilClosing !== null) {
          const hours = Math.floor(timeUntilClosing / 60);
          const minutes = timeUntilClosing % 60;
          
          if (hours > 0) {
            statusMessage = `${hours} saat ${minutes} dakika sonra kapanacak`;
          } else {
            statusMessage = `${minutes} dakika sonra kapanacak`;
          }
        } else {
          statusMessage = 'Açık';
        }
      } else {
        if (nextOpeningTime) {
          const diffMs = nextOpeningTime.getTime() - now.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          
          if (diffDays > 0) {
            statusMessage = `${diffDays} gün sonra açılacak`;
          } else if (diffHours > 0) {
            statusMessage = `${diffHours} saat ${diffMinutes} dakika sonra açılacak`;
          } else {
            statusMessage = `${diffMinutes} dakika sonra açılacak`;
          }
        } else {
          statusMessage = 'Süresiz kapalı';
        }
      }

      setTimeStatus({
        isOpen,
        nextOpeningTime,
        timeUntilClosing,
        statusMessage
      });
    };

    // İlk güncellemeyı yap
    updateTimeStatus();
    
    // Her dakika güncelle
    const interval = setInterval(updateTimeStatus, 60000);
    
    return () => clearInterval(interval);
  }, [openingHours]); // openingHours dependency

  return timeStatus;
};
