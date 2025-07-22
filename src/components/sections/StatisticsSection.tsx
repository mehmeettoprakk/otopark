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
    <div className={getCardClasses(isDarkMode, 'p-6')}>
      <div className={COMMON_CLASSES.flexBetween}>
        <div>
          <p className={`text-sm font-medium ${getTextClasses('muted', isDarkMode)}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${getTextClasses('primary', isDarkMode)}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg`}>
          {icon}
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
      icon: <Car className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Müsait',
      value: statistics.available,
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Az Yer',
      value: statistics.nearlyFull,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    {
      title: 'Dolu',
      value: statistics.occupied,
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-red-500 to-red-600'
    }
  ]

  return (
    <div className="mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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