'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Edit, Trash2, Car, ChevronDown } from 'lucide-react'
import { ParkingLot, ParkingStatus } from '@/types/parking'
import { formatDate, calculateOccupancyPercentage } from '@/lib/utils'

interface ParkingLotTableProps {
  parkingLots: ParkingLot[]
  onSetShowMapPicker: () => void
  onSetShowNewForm: () => void
  onEditLot: (lot: ParkingLot) => void
  onDeleteLot: (id: string) => void
  onQuickOccupancyUpdate: (lot: ParkingLot, change: number) => void
  onStatusChange: (lot: ParkingLot, status: ParkingStatus) => void
  getStatusText: (status: ParkingStatus) => string
}

export default function ParkingLotTable({
  parkingLots,
  onSetShowMapPicker,
  onSetShowNewForm,
  onEditLot,
  onDeleteLot,
  onQuickOccupancyUpdate,
  onStatusChange,
  getStatusText
}: ParkingLotTableProps) {
  return (
    <Card className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-white/60 backdrop-blur-md border-b border-white/20 px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span>🏢 Otoparklar</span>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              onClick={onSetShowMapPicker}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base font-bold"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">🗺️ Harita ile Ekle</span>
              <span className="sm:hidden">🗺️ Harita</span>
            </Button>
            <Button 
              onClick={onSetShowNewForm}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base font-bold"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">✏️ Manuel Ekle</span>
              <span className="sm:hidden">✏️ Manuel</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden lg:block w-full">
          <table className="w-full min-w-full table-auto">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  🏢 Otopark
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  🚗 Doluluk & Güncelleme
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  💰 Ücret
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  📊 Durum
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  🕒 Güncelleme
                </th>
                <th className="px-6 py-5 text-right text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  ⚡ İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {parkingLots.map((lot) => {
                const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
                return (
                  <tr key={lot.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
                    <td className="px-6 py-6 align-top">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-500 dark:bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Car className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{lot.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{lot.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="mb-3">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          {lot.occupiedSpaces}/{lot.totalSpaces} (%{occupancyPercentage})
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-700 ${
                              occupancyPercentage >= 90 ? 'bg-rose-500 dark:bg-rose-400' :
                              occupancyPercentage >= 70 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-emerald-500 dark:bg-emerald-400'
                            }`}
                            style={{ width: `${occupancyPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-700">
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, -10)}
                              disabled={lot.occupiedSpaces <= 0}
                              className="w-8 h-7 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="10 araç çıktı"
                            >
                              -10
                            </button>
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, -5)}
                              disabled={lot.occupiedSpaces <= 0}
                              className="w-7 h-7 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="5 araç çıktı"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, -3)}
                              disabled={lot.occupiedSpaces <= 0}
                              className="w-7 h-7 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="3 araç çıktı"
                            >
                              -3
                            </button>
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, -1)}
                              disabled={lot.occupiedSpaces <= 0}
                              className="w-7 h-7 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="1 araç çıktı"
                            >
                              -1
                            </button>
                          </div>
                          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                          <div className="flex items-center gap-1 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, 1)}
                              disabled={lot.occupiedSpaces >= lot.totalSpaces}
                              className="w-7 h-7 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="1 araç girdi"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, 3)}
                              disabled={lot.occupiedSpaces >= lot.totalSpaces}
                              className="w-7 h-7 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="3 araç girdi"
                            >
                              +3
                            </button>
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, 5)}
                              disabled={lot.occupiedSpaces >= lot.totalSpaces}
                              className="w-7 h-7 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="5 araç girdi"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => onQuickOccupancyUpdate(lot, 10)}
                              disabled={lot.occupiedSpaces >= lot.totalSpaces}
                              className="w-8 h-7 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="10 araç girdi"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-base">₺</span>
                        </div>
                        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {lot.hourlyRate}₺
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="relative group">
                        <button
                          className={`
                            inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200
                            ${(lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.AVAILABLE 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-200' 
                              : (lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.OCCUPIED
                              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 hover:bg-rose-200'
                              : (lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.MAINTENANCE
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-200'
                              : (lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.CLOSED
                              ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-200'
                            }
                          `}
                        >
                          {getStatusText(lot.status || ParkingStatus.AVAILABLE)}
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                          {Object.values(ParkingStatus).map((status) => (
                            <button
                              key={status}
                              onClick={() => onStatusChange(lot, status)}
                              className={`
                                w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors
                                ${(lot.status || ParkingStatus.AVAILABLE) === status ? 'bg-slate-100 dark:bg-slate-700 font-medium' : ''}
                              `}
                            >
                              {getStatusText(status)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(lot.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right align-top">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onEditLot(lot)}
                          className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all duration-200 flex items-center justify-center"
                          title="Düzenle"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onDeleteLot(lot.id)}
                          className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-all duration-200 flex items-center justify-center"
                          title="Sil"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {parkingLots.map((lot) => {
            const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
            return (
              <div key={lot.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Card Header */}
                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-4 border-b border-slate-200 dark:border-slate-600">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-indigo-500 dark:bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg mb-1 leading-tight">{lot.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">{lot.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => onEditLot(lot)}
                        className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all duration-200 flex items-center justify-center"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteLot(lot.id)}
                        className="w-9 h-9 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all duration-200 flex items-center justify-center"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-4">
                  {/* Occupancy Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">🚗 Doluluk</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {lot.occupiedSpaces}/{lot.totalSpaces} (%{occupancyPercentage})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ${
                          occupancyPercentage >= 90 ? 'bg-rose-500 dark:bg-rose-400' :
                          occupancyPercentage >= 70 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-emerald-500 dark:bg-emerald-400'
                        }`}
                        style={{ width: `${occupancyPercentage}%` }}
                      ></div>
                    </div>
                    
                    {/* Mobile Quick Update Buttons */}
                    <div className="flex justify-center gap-2">
                      <div className="flex items-center gap-1 p-1 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-700">
                        <button
                          onClick={() => onQuickOccupancyUpdate(lot, -5)}
                          disabled={lot.occupiedSpaces <= 0}
                          className="w-7 h-6 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="5 araç çıktı"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => onQuickOccupancyUpdate(lot, -1)}
                          disabled={lot.occupiedSpaces <= 0}
                          className="w-6 h-6 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="1 araç çıktı"
                        >
                          -1
                        </button>
                      </div>
                      <div className="flex items-center gap-1 p-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                        <button
                          onClick={() => onQuickOccupancyUpdate(lot, 1)}
                          disabled={lot.occupiedSpaces >= lot.totalSpaces}
                          className="w-6 h-6 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="1 araç girdi"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onQuickOccupancyUpdate(lot, 5)}
                          disabled={lot.occupiedSpaces >= lot.totalSpaces}
                          className="w-7 h-6 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="5 araç girdi"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">💰 Ücret</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs">₺</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lot.hourlyRate}₺</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">📊 Durum</span>
                      <div className={`
                        inline-flex items-center px-2 py-1 rounded text-xs font-medium w-full justify-center
                        ${(lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.AVAILABLE 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' 
                          : (lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.OCCUPIED
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
                          : (lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.MAINTENANCE
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                          : (lot.status || ParkingStatus.AVAILABLE) === ParkingStatus.CLOSED
                          ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        }
                      `}>
                        <span className="truncate">{getStatusText(lot.status || ParkingStatus.AVAILABLE)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Last Update */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">🕒 Son Güncelleme</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(lot.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
