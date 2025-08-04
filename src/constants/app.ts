// Application Constants
export const APP_CONFIG = {
  DEFAULT_CENTER: {
    latitude: 39.1667,
    longitude: 35.1667,
    zoom: 6
  },
  OCCUPANCY_THRESHOLDS: {
    NEARLY_FULL: 50,
    FULL: 80,
    OCCUPIED: 100
  },
  EARTH_RADIUS_KM: 6371,
  ANIMATION_DELAYS: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500
  },
  UI: {
    HEADER_HEIGHT: 20,
    SIDEBAR_WIDTH: 96,
    MAP_HEIGHT: '60vh',
    FULL_MAP_HEIGHT: '100%'
  }
} as const

// Status Configuration
export const STATUS_STYLES = {
  AVAILABLE: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    emoji: '🟢',
    text: 'Müsait',
    borderColor: 'border-green-300'
  },
  NEARLY_FULL: {
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    emoji: '🟡',
    text: 'Az Yer',
    borderColor: 'border-orange-300'
  },
  OCCUPIED: {
    color: 'text-red-600',
    bg: 'bg-red-100',
    emoji: '🔴',
    text: 'Dolu',
    borderColor: 'border-red-300'
  },
  CLOSED: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    emoji: '🚫',
    text: 'Kapalı',
    borderColor: 'border-gray-300'
  }
} as const

// URL Constants
export const GOOGLE_MAPS_URL = 'https://www.google.com/maps/dir/?api=1&destination='

// Local Storage Keys
export const STORAGE_KEYS = {
  DARK_MODE: 'darkMode'
} as const

// Feature Flags and Environment
export const FEATURES = {
  ENABLE_SEEDING: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development'
} as const 