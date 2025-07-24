'use client'

import React from 'react'
import { Car } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  description?: string
  isDarkMode?: boolean
}

export default function LoadingScreen({ 
  message = 'Otopark Verileri Yükleniyor',
  description = 'Lütfen bekleyin...',
  isDarkMode = false 
}: LoadingScreenProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-300 flex items-center justify-center p-4 ${
      isDarkMode 
        ? 'from-gray-900 via-slate-900 to-indigo-900' 
        : 'from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Modern Loading Animation */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className={`w-24 h-24 border-4 rounded-full mx-auto animate-spin ${
            isDarkMode 
              ? 'border-gray-700 border-t-blue-400' 
              : 'border-gray-200 border-t-blue-600'
          }`}></div>
          
          {/* Inner car icon */}
          <div className={`absolute inset-0 flex items-center justify-center ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            <Car className="w-8 h-8 animate-bounce" />
          </div>
          
          {/* Pulsing effect */}
          <div className={`absolute inset-0 w-24 h-24 rounded-full mx-auto animate-ping opacity-20 ${
            isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
          }`}></div>
        </div>

        {/* Text content */}
        <div className={`backdrop-blur-xl border rounded-2xl shadow-2xl p-8 max-w-md ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700/50' 
            : 'bg-white/90 border-white/50'
        }`}>
          <h1 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {message}
          </h1>
          
          <p className={`text-base ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {description}
          </p>

          {/* Loading dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
