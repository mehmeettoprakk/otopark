import React from 'react'
import { Zap } from 'lucide-react'
import { getTextClasses, COMMON_CLASSES } from '@/utils/styleUtils'

interface HeroSectionProps {
  isDarkMode: boolean
}

export default function HeroSection({ isDarkMode }: HeroSectionProps) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-800 mb-4 animate-fade-in">
        <Zap className="h-4 w-4" />
        <span>Gerçek Zamanlı Takip</span>
      </div>
      
      <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in-up transition-colors duration-300 ${
        getTextClasses('primary', isDarkMode)
      }`}>
        En Yakın{' '}
        <span className={COMMON_CLASSES.primaryGradient}>
          Otoparkları
        </span>{' '}
        Keşfedin
      </h2>
      
      <p className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto animate-fade-in-up animation-delay-200 transition-colors duration-300 ${
        getTextClasses('secondary', isDarkMode)
      }`}>
        Akıllı algoritma ile size en uygun park yerini bulun. Gerçek zamanlı doluluk oranları ve mesafe bilgileri.
      </p>
    </div>
  )
} 