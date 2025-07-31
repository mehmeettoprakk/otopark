import React from 'react'
import { Car, BarChart3, TrendingUp, Users } from 'lucide-react'
import { getCardClasses, getTextClasses, COMMON_CLASSES } from '@/utils/styleUtils'

interface ParkingStatistics {
  total: number
  available: number
  nearlyFull: number
  occupied: number
  maintenance: number
  closed: number
  reserved: number
}

interface StatisticsSectionProps {
  statistics: ParkingStatistics
  isDarkMode: boolean
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
  color: string
  isDarkMode: boolean
}

function StatCard({ icon, title, value, color, isDarkMode }: StatCardProps) {
  return (
    <div className={getCardClasses(isDarkMode, 'p-3 sm:p-4 md:p-6')}>
      <div className={COMMON_CLASSES.flexBetween}>
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm font-medium ${getTextClasses('muted', isDarkMode)} mb-1`}>
            {title}
          </p>
          <p className={`text-lg sm:text-xl md:text-2xl font-bold ${getTextClasses('primary', isDarkMode)} truncate`}>
            {value}
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color} shadow-lg flex-shrink-0 ml-2`}>
          <div className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StatisticsSection({ statistics, isDarkMode }: StatisticsSectionProps) {
  const statCards = [
    {
      title: 'Toplam Otopark',
      value: statistics.total,
      icon: <Car className="h-full w-full text-white" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Müsait',
      value: statistics.available,
      icon: <BarChart3 className="h-full w-full text-white" />,
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Az Yer',
      value: statistics.nearlyFull,
      icon: <TrendingUp className="h-full w-full text-white" />,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    {
      title: 'Dolu',
      value: statistics.occupied,
      icon: <Users className="h-full w-full text-white" />,
      color: 'bg-gradient-to-r from-red-500 to-red-600'
    }
  ]

  return (
    <div className="mb-8 sm:mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  )
} 