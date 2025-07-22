import { useState, useEffect } from 'react'
import { STORAGE_KEYS } from '@/constants/app'

interface UseDarkModeReturn {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (enabled: boolean) => void
}

export function useDarkMode(): UseDarkModeReturn {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE)
    const shouldEnableDarkMode = savedDarkMode === 'true'
    
    setIsDarkMode(shouldEnableDarkMode)
    updateDocumentClasses(shouldEnableDarkMode)
  }, [])

  const updateDocumentClasses = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled)
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, enabled.toString())
    updateDocumentClasses(enabled)
  }

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode)
  }

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode
  }
} 