'use client'

import Button from '@/components/ui/Button'
import { Shield, Sun, Moon, Database, LogOut } from 'lucide-react'

interface AdminHeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  isSeeding: boolean
  onSeedData: () => void
  onLogout: () => void
}

export default function AdminHeader({ 
  isDarkMode, 
  toggleDarkMode, 
  isSeeding, 
  onSeedData, 
  onLogout 
}: AdminHeaderProps) {
  return (
    <header className={`z-10 backdrop-blur-lg border-b sticky top-0 shadow-lg transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/90 border-gray-700/50' 
        : 'bg-white/80 border-white/20'
    }`}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Otopark yönetimi ve istatistikler
              </p>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => window.location.href = '/'}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800/50 hover:bg-blue-900/50' 
                  : 'bg-white/50 hover:bg-blue-50/70'
              }`}
              title="Ana Sayfa"
            >
              <span className="text-lg">🏠</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              title={isDarkMode ? 'Aydınlık Tema' : 'Karanlık Tema'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </button>
            <button
              onClick={onLogout}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800/50 hover:bg-red-900/50' 
                  : 'bg-white/50 hover:bg-red-50/70'
              }`}
              title="Çıkış Yap"
            >
              <LogOut className="h-5 w-5 text-red-500" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              title={isDarkMode ? 'Aydınlık Tema' : 'Karanlık Tema'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </button>
            <Button 
              variant="outline" 
              onClick={onSeedData}
              disabled={isSeeding}
              className={`backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl shadow-lg font-semibold ${
                isDarkMode 
                  ? 'bg-gray-800/70 border-amber-600 text-amber-400 hover:bg-amber-900/50 hover:border-amber-500' 
                  : 'bg-white/70 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400'
              }`}
            >
              <Database className="h-4 w-4 mr-2" />
              {isSeeding ? 'Ekleniyor...' : 'Demo Veriler'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className={`backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl shadow-lg font-semibold ${
                isDarkMode 
                  ? 'bg-gray-800/70 border-blue-600 text-blue-400 hover:bg-blue-900/50 hover:border-blue-500' 
                  : 'bg-white/70 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
              }`}
            >
              Ana Sayfa
            </Button>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className={`backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl shadow-lg font-semibold ${
                isDarkMode 
                  ? 'bg-gray-800/70 border-red-600 text-red-400 hover:bg-red-900/50 hover:border-red-500' 
                  : 'bg-white/70 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400'
              }`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
