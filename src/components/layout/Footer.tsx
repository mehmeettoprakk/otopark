import React from 'react'
import { Car, Heart, Github, Mail, Phone } from 'lucide-react'
import { getDarkModeClasses, COMMON_CLASSES } from '@/utils/styleUtils'

interface FooterProps {
  isDarkMode: boolean
}

export default function Footer({ isDarkMode }: FooterProps) {
  const darkModeClasses = getDarkModeClasses(isDarkMode)

  return (
    <footer className={`relative z-10 mt-16 transition-colors duration-300 ${darkModeClasses.footer} backdrop-blur-lg border-t`}>
      <div className={`${COMMON_CLASSES.container} py-6 sm:py-8`}>
        {/* Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Car className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Otopark Takip
                </h3>
              </div>
            </div>
            <p className={`text-xs sm:text-sm transition-colors duration-300 leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Akıllı otopark yönetim sistemi ile park yerinizi kolayca bulun.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className={`text-sm font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>İletişim</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <Mail className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  info@otoparktakip.com
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <Phone className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  +90 (212) 555-0123
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className={`text-sm font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>Bağlantılar</h4>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/mehmeettoprakk"
                className={`p-2 rounded-lg border transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50' 
                    : 'border-gray-200 bg-white/50 hover:bg-white/80'
                }`}
              >
                <Github className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </a>
              <a
                href="#"
                className={`p-2 rounded-lg border transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50' 
                    : 'border-gray-200 bg-white/50 hover:bg-white/80'
                }`}
              >
                <Heart className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className={`text-xs transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              © 2025 Otopark Takip. Tüm hakları saklıdır.
            </p>
            <p className={`text-xs transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              v1.0.0 - Made with ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 