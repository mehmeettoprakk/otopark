'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useParkingLots } from '@/hooks/useFirebase'
import { useToast } from '@/hooks/useToast'
import { useDarkMode } from '@/hooks/useDarkMode'
import { ToastContainer } from '@/components/ui/Toast'
import LoginForm from '@/components/admin/LoginForm'
import ParkingLotForm from '@/components/admin/ParkingLotForm'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminStats from '@/components/admin/AdminStats'
import ParkingLotTable from '@/components/admin/ParkingLotTable'
import { ParkingLot, ParkingStatus } from '@/types/parking'
import { seedDatabase } from '@/utils/seedData'
import { Shield } from 'lucide-react'
import dynamic from 'next/dynamic'

// FullPageLocationPicker'ı dinamik import et (SSR problemini önlemek için)
const FullPageLocationPicker = dynamic(() => import('@/components/Map/FullPageLocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-pulse flex items-center justify-center z-50">
      <div className="relative z-10 text-center">
        <div className="mb-4 text-4xl animate-bounce">🗺️</div>
        <div className="text-gray-700 font-semibold text-lg">Harita yükleniyor...</div>
        <div className="text-gray-500 text-sm mt-2">Lütfen bekleyin</div>
      </div>
    </div>
  )
})

// Ana admin panel bileşeni
function AdminDashboard() {
  const { logout } = useAuth()
  const { parkingLots, loading, addParkingLot, updateParkingLot, deleteParkingLot } = useParkingLots()
  const { showError, showSuccess, toasts, removeToast } = useToast()
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormData, setNewFormData] = useState<Partial<ParkingLot>>({})
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const handleSave = async (data: Partial<ParkingLot>) => {
    try {
      if (editingLot) {
        await updateParkingLot(editingLot.id, data)
        showSuccess('Otopark başarıyla güncellendi!')
        setEditingLot(null)
      } else {
        await addParkingLot(data as Omit<ParkingLot, 'id' | 'createdAt' | 'updatedAt'>)
        showSuccess('Yeni otopark başarıyla eklendi!')
        setShowNewForm(false)
        setNewFormData({})
      }
    } catch {
      showError('Otopark kaydedilirken hata oluştu.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu otoparkı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteParkingLot(id)
        showSuccess('Otopark başarıyla silindi!')
      } catch {
        showError('Otopark silinirken hata oluştu.')
      }
    }
  }

  const handleQuickOccupancyUpdate = async (lot: ParkingLot, change: number) => {
    const newOccupiedSpaces = Math.max(0, Math.min(lot.totalSpaces, lot.occupiedSpaces + change))
    
    const occupancyPercentage = (newOccupiedSpaces / lot.totalSpaces) * 100
    let newStatus: ParkingStatus
    
    if (occupancyPercentage >= 100) {
      newStatus = ParkingStatus.OCCUPIED
    } else if (occupancyPercentage >= 50) {
      newStatus = ParkingStatus.NEARLY_FULL
    } else {
      newStatus = ParkingStatus.AVAILABLE
    }
    
    try {
      await updateParkingLot(lot.id, { 
        occupiedSpaces: newOccupiedSpaces,
        status: newStatus
      })
      showSuccess(`${lot.name} güncellendi: ${newOccupiedSpaces}/${lot.totalSpaces} (${getStatusText(newStatus)})`)
    } catch {
      showError('Doluluk güncellenirken hata oluştu.')
    }
  }

  const handleStatusChange = async (lot: ParkingLot, newStatus: ParkingStatus) => {
    try {
      await updateParkingLot(lot.id, { status: newStatus })
      showSuccess(`${lot.name} durumu "${getStatusText(newStatus)}" olarak güncellendi`)
    } catch {
      showError('Durum güncellenirken hata oluştu.')
    }
  }

  const getStatusText = (status: ParkingStatus) => {
    switch (status) {
      case ParkingStatus.AVAILABLE: return 'Müsait'
      case ParkingStatus.NEARLY_FULL: return 'Az Yer'
      case ParkingStatus.OCCUPIED: return 'Dolu'
      case ParkingStatus.CLOSED: return 'Kapalı'
      default: return 'Müsait'
    }
  }

  const handleSeedData = async () => {
    if (confirm('Demo verileri eklensin mi? Bu işlem mevcut verilerin üzerine yazabilir.')) {
      setIsSeeding(true)
      try {
        await seedDatabase()
        showSuccess('Demo verileri başarıyla eklendi!')
      } catch {
        showError('Demo verileri eklenirken hata oluştu.')
      } finally {
        setIsSeeding(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-center bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Panel Yükleniyor
          </h2>
          <p className="text-gray-600 font-medium">Veriler hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden pb-14 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <AdminHeader 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isSeeding={isSeeding}
        onSeedData={handleSeedData}
        onLogout={logout}
      />

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <AdminStats parkingLots={parkingLots} />

        {/* Form veya Otopark Listesi */}
        {(editingLot || showNewForm) ? (
          <ParkingLotForm
            lot={editingLot || newFormData}
            onSave={handleSave}
            onCancel={() => {
              setEditingLot(null)
              setShowNewForm(false)
              setNewFormData({})
            }}
          />
        ) : (
          <ParkingLotTable
            parkingLots={parkingLots}
            onSetShowMapPicker={() => setShowMapPicker(true)}
            onSetShowNewForm={() => setShowNewForm(true)}
            onEditLot={setEditingLot}
            onDeleteLot={handleDelete}
            onQuickOccupancyUpdate={handleQuickOccupancyUpdate}
            onStatusChange={handleStatusChange}
            getStatusText={getStatusText}
          />
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {showMapPicker && (
        <FullPageLocationPicker
          onLocationSelect={(location) => {
            setNewFormData({
              ...newFormData,
              latitude: location.lat,
              longitude: location.lng
            })
            setShowMapPicker(false)
            setShowNewForm(true)
          }}
          onCancel={() => setShowMapPicker(false)}
        />
      )}
      
      {/* Custom Styles */}
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
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  )
}

// Ana sayfa bileşeni
export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Admin olmayan kullanıcılar ve giriş yapmamış kullanıcılar için
  if (!user) {
    return <LoginForm />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır. Admin paneline sadece yetkili kullanıcılar erişebilir.</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
} 