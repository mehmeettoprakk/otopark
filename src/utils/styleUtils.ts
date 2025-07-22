import { cn } from '@/lib/utils'
import { ParkingStatus } from '@/types/parking'
import { STATUS_STYLES } from '@/constants/app'

// Dark mode styling utilities
export const getDarkModeClasses = (isDarkMode: boolean) => ({
  header: isDarkMode 
    ? 'bg-gray-900/90 border-gray-700/50 shadow-lg' 
    : 'bg-white/80 border-white/20',
  
  background: isDarkMode 
    ? 'from-gray-900 via-slate-900 to-indigo-900' 
    : 'from-blue-50 via-indigo-50 to-purple-50',
    
  text: {
    primary: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
  },
  
  card: isDarkMode 
    ? 'bg-gray-800/70 border-gray-700/50' 
    : 'bg-white/70 border-white/50',
    
  sidebar: isDarkMode 
    ? 'border-gray-700/20 bg-gradient-to-r from-gray-700/70 to-blue-800/70' 
    : 'border-white/20 bg-gradient-to-r from-blue-100/70 to-purple-100/70',
    
  footer: isDarkMode 
    ? 'bg-gray-900/95 border-gray-700/50' 
    : 'bg-white/95 border-gray-200/50'
})

// Status-related styling
export const getStatusStyle = (status: ParkingStatus, occupancy: number) => {
  switch (status) {
    case ParkingStatus.AVAILABLE:
      if (occupancy < 50) return STATUS_STYLES.AVAILABLE
      if (occupancy < 80) return STATUS_STYLES.NEARLY_FULL
      return STATUS_STYLES.OCCUPIED
    case ParkingStatus.NEARLY_FULL:
      return STATUS_STYLES.NEARLY_FULL
    case ParkingStatus.OCCUPIED:
      return STATUS_STYLES.OCCUPIED
    case ParkingStatus.MAINTENANCE:
      return STATUS_STYLES.MAINTENANCE
    case ParkingStatus.CLOSED:
      return STATUS_STYLES.CLOSED
    case ParkingStatus.RESERVED:
      return STATUS_STYLES.RESERVED
    default:
      return STATUS_STYLES.AVAILABLE
  }
}

// Common CSS class patterns
export const COMMON_CLASSES = {
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  
  // Cards and surfaces
  glassmorphism: 'backdrop-blur-lg border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300',
  modernCard: 'bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300',
  
  // Gradients
  primaryGradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  bgGradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
  
  // Animations
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  
  // Interactive elements
  hoverScale: 'transform hover:scale-105 active:scale-95 transition-transform duration-300',
  buttonBase: 'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300'
} as const

// Helper function to combine common class patterns
export const getCardClasses = (isDarkMode: boolean, additionalClasses?: string) => {
  const darkModeClasses = getDarkModeClasses(isDarkMode)
  return cn(
    COMMON_CLASSES.glassmorphism,
    darkModeClasses.card,
    additionalClasses
  )
}

export const getHeaderClasses = (isDarkMode: boolean) => {
  const darkModeClasses = getDarkModeClasses(isDarkMode)
  return cn(
    'relative z-10 top-0 backdrop-blur-lg transition-colors duration-300 border-b',
    darkModeClasses.header
  )
}

export const getTextClasses = (variant: 'primary' | 'secondary' | 'muted', isDarkMode: boolean) => {
  const darkModeClasses = getDarkModeClasses(isDarkMode)
  return darkModeClasses.text[variant]
} 