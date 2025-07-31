'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Car, Users, BarChart3 } from 'lucide-react'
import { ParkingLot } from '@/types/parking'

interface AdminStatsProps {
  parkingLots: ParkingLot[]
}

export default function AdminStats({ parkingLots }: AdminStatsProps) {
  const totalSpaces = parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0)
  const totalOccupied = parkingLots.reduce((sum, lot) => sum + lot.occupiedSpaces, 0)
  const averageOccupancy = totalSpaces > 0 ? Math.round((totalOccupied / totalSpaces) * 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 uppercase tracking-wider">Toplam Otopark</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{parkingLots.length}</p>
            </div>
            <div className="flex-shrink-0 ml-2 sm:ml-3 md:ml-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                <Car className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-200">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 uppercase tracking-wider">Toplam Park Yeri</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{totalSpaces}</p>
            </div>
            <div className="flex-shrink-0 ml-2 sm:ml-3 md:ml-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 uppercase tracking-wider">Dolu Park Yeri</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{totalOccupied}</p>
            </div>
            <div className="flex-shrink-0 ml-2 sm:ml-3 md:ml-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-600">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 uppercase tracking-wider">Ortalama Doluluk</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">%{averageOccupancy}</p>
            </div>
            <div className="flex-shrink-0 ml-2 sm:ml-3 md:ml-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
