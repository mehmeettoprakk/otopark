import React from 'react'
import { Car, Sun, Moon, Menu, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getHeaderClasses, COMMON_CLASSES } from '@/utils/styleUtils'

interface HeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export default function Header({
  isDarkMode,
  toggleDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: HeaderProps) {
  return (
    <header className={getHeaderClasses(isDarkMode)}>
      <div className={COMMON_CLASSES.container}>
        <div className={`${COMMON_CLASSES.flexBetween} h-20 py-2`}>
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Otopark Takip
              </h1>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Gerçek zamanlı otopark doluluk takibi
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="relative overflow-hidden"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t backdrop-blur-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'border-gray-700/20 bg-gray-800/50' 
              : 'border-white/20 bg-white/50'
          }`}>
            <div className="px-4 py-6 space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-full justify-start"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-5 w-5 text-yellow-500 mr-3" />
                    Açık Tema
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 text-blue-600 mr-3" />
                    Koyu Tema
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 