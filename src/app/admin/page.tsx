'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useParkingLots } from '@/hooks/useFirebase'
import { useToast } from '@/hooks/useToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ToastContainer } from '@/components/ui/Toast'
import { ParkingLot, ParkingStatus } from '@/types/parking'
import { formatDate, calculateOccupancyPercentage } from '@/lib/utils'
import { seedDatabase } from '@/utils/seedData'
import { Plus, Edit, Trash2, Car, Users, BarChart3, LogOut, Database, Shield, ChevronDown, Sun, Moon } from 'lucide-react'
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

// Giriş formu bileşeni
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { login } = useAuth()
  const { showError, toasts, removeToast } = useToast()

  // Dark mode'u localStorage'dan yükle
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const success = await login(email, password)
    if (!success) {
      showError('Geçersiz email veya şifre. Firebase Authentication konsolundan kontrol edin.', 5000)
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300 ${
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

      <Card className={`w-full max-w-md backdrop-blur-lg border rounded-2xl shadow-2xl relative z-10 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/70 border-gray-700/50' 
          : 'bg-white/70 border-white/50'
      }`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Paneli
          </CardTitle>
          <p className={`mt-2 font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Güvenli giriş yapın</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                📧 Email Adresi
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700/80 border-gray-600/50 text-gray-100 placeholder-gray-400 focus:bg-gray-700' 
                    : 'bg-white/80 border-white/50 text-gray-900 placeholder-gray-500 focus:bg-white'
                }`}
                placeholder="example@otopark.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                🔒 Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700/80 border-gray-600/50 text-gray-100 placeholder-gray-400 focus:bg-gray-700' 
                    : 'bg-white/80 border-white/50 text-gray-900 placeholder-gray-500 focus:bg-white'
                }`}
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg"
              disabled={loading}
            >
              {loading ? '🔄 Giriş yapılıyor...' : '🚀 Giriş Yap'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🔒</span>
                </div>
              </div>
              <div>
                <h4 className="text-amber-800 font-semibold text-sm mb-1">Firebase Authentication</h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Lütfen Firebase konsolundan giriş yapınız.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
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
      `}</style>
    </div>
  )
}

// Otopark ekleme/düzenleme formu
function ParkingLotForm({ 
  lot, 
  onSave, 
  onCancel 
}: { 
  lot?: ParkingLot | Partial<ParkingLot>
  onSave: (data: Partial<ParkingLot>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: lot?.name || '',
    address: lot?.address || '',
    latitude: lot?.latitude?.toString() || '',
    longitude: lot?.longitude?.toString() || '',
    totalSpaces: lot?.totalSpaces?.toString() || '',
    occupiedSpaces: lot?.occupiedSpaces?.toString() || '',
    hourlyRate: lot?.hourlyRate?.toString() || '',
    isActive: lot?.isActive ?? true,
    status: lot?.status || ParkingStatus.AVAILABLE
  })

  // Doluluk oranına göre durumu otomatik güncelle
  useEffect(() => {
    const total = parseInt(formData.totalSpaces) || 0
    const occupied = parseInt(formData.occupiedSpaces) || 0
    
    if (total > 0) {
      const occupancyPercentage = (occupied / total) * 100
      
      let newStatus: ParkingStatus
      if (occupancyPercentage >= 100) {
        newStatus = ParkingStatus.OCCUPIED  // %100 dolu
      } else if (occupancyPercentage >= 50) {
        newStatus = ParkingStatus.NEARLY_FULL  // %50-99 az yer
      } else {
        newStatus = ParkingStatus.AVAILABLE  // %0-49 müsait
      }
      
      if (formData.status !== newStatus) {
        setFormData(prev => ({ ...prev, status: newStatus }))
      }
    }
  }, [formData.totalSpaces, formData.occupiedSpaces, formData.status])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      totalSpaces: parseInt(formData.totalSpaces) || 0,
      occupiedSpaces: parseInt(formData.occupiedSpaces) || 0,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      status: formData.status
    })
  }

  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 border-b border-white/20 px-8 py-6">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span>{lot ? '✏️ Otoparkı Düzenle' : '➕ Yeni Otopark Ekle'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🏢</span>
                <span>Otopark Adı</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900 placeholder-gray-500"
                placeholder="Örn: Taksim Meydanı Otoparkı"
                required
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-800 mb-3 items-center space-x-2">
                <span className="text-2xl">🚗</span>
                <span>Toplam Park Yeri Sayısı</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalSpaces}
                onChange={(e) => setFormData({...formData, totalSpaces: e.target.value})}
                className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900 placeholder-gray-500"
                placeholder="Örn: 150"
                required
              />
            </div>
            <div>
              <label className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🅿️</span>
                <span>Şu An Dolu Park Yeri</span>
              </label>
              <input
                type="number"
                min="0"
                max={parseInt(formData.totalSpaces) || 999}
                value={formData.occupiedSpaces}
                onChange={(e) => setFormData({...formData, occupiedSpaces: e.target.value})}
                className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900 placeholder-gray-500"
                placeholder="Örn: 75"
              />
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  💡 <strong>İpucu:</strong> Otoparka araç geldiğinde/gittiğinde bu sayıyı güncelleyin
                </p>
              </div>
            </div>
            <div>
              <label className="block text-base font-bold text-gray-800 mb-3 items-center space-x-2">
                <span className="text-2xl">💰</span>
                <span>Saatlik Ücret (₺)</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900 placeholder-gray-500"
                placeholder="Örn: 25.50"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <span className="text-2xl">📍</span>
                <span>Otopark Adresi</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900 placeholder-gray-500"
                placeholder="Örn: Taksim Meydanı, Beyoğlu/İstanbul"
                required
              />
            </div>
            {formData.latitude && formData.longitude ? (
              <div className="md:col-span-2 bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl border-2 border-green-300 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">📍</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-green-900 mb-1">✅ Konum Başarıyla Seçildi!</h4>
                    <p className="text-base text-green-800 font-medium">
                      📍 Enlem: {Number(formData.latitude).toFixed(6)} | 🌍 Boylam: {Number(formData.longitude).toFixed(6)}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      🎯 Otopark konumu haritada işaretlendi. Devam edebilirsiniz.
                    </p>
                  </div>
                </div>
            </div>
            ) : (
              <>
            <div>
                  <label className="block text-base font-bold text-gray-800 mb-3 items-center space-x-2">
                    <span className="text-2xl">🌍</span>
                    <span>Enlem (Latitude)</span>
                    <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900 placeholder-gray-500"
                    placeholder="Örn: 41.0369"
                required
              />
            </div>
            <div>
                  <label className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <span className="text-2xl">🌍</span>
                    <span>Boylam (Longitude)</span>
                    <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900 placeholder-gray-500"
                    placeholder="Örn: 28.9852"
                required
              />
            </div>
              </>
            )}
            <div>
              <label className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <span>Durum</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as ParkingStatus})}
                className="w-full px-4 py-4 bg-white/80 border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-base font-medium text-gray-900"
              >
                <option value={ParkingStatus.AVAILABLE}>🟢 Müsait</option>
                <option value={ParkingStatus.NEARLY_FULL}>🟡 Az Yer</option>
                <option value={ParkingStatus.OCCUPIED}>🔴 Dolu</option>
                <option value={ParkingStatus.MAINTENANCE}>🔧 Bakımda</option>
                <option value={ParkingStatus.CLOSED}>🚫 Kapalı</option>
                <option value={ParkingStatus.RESERVED}>🅿️ Rezerve</option>
              </select>
              <div className="mt-2 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  💡 <strong>Otomatik:</strong> Doluluk oranına göre durum otomatik güncellenir (Manuel değiştirebilirsiniz)
                </p>
              </div>
            </div>
            <div className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl border-2 border-gray-300 shadow-sm">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-4"
              />
              <label htmlFor="isActive" className="text-base font-bold text-gray-800 flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <span>Otopark Aktif (Kullanıma Açık)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4 pt-8 border-t border-white/20">
            <Button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg">
              {lot ? '✏️ Güncelle' : '➕ Ekle'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-4 bg-white/80 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-bold">
              ❌ İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

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
  const [isDarkMode, setIsDarkMode] = useState(false)


  // Dark mode'u localStorage'dan yükle
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    localStorage.setItem('darkMode', (!isDarkMode).toString())
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }



  const handleSave = async (data: Partial<ParkingLot>) => {
    try {
      if (editingLot) {
        // Mevcut otopark düzenleme
        await updateParkingLot(editingLot.id, data)
        showSuccess('Otopark başarıyla güncellendi!')
        setEditingLot(null)
      } else {
        // Yeni otopark ekleme
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

  // Hızlı doluluk güncelleme
  const handleQuickOccupancyUpdate = async (lot: ParkingLot, change: number) => {
    const newOccupiedSpaces = Math.max(0, Math.min(lot.totalSpaces, lot.occupiedSpaces + change))
    
    // Doluluk oranına göre durumu otomatik güncelle
    const occupancyPercentage = (newOccupiedSpaces / lot.totalSpaces) * 100
    let newStatus: ParkingStatus
    
    if (occupancyPercentage >= 100) {
      newStatus = ParkingStatus.OCCUPIED  // %100 dolu
    } else if (occupancyPercentage >= 50) {
      newStatus = ParkingStatus.NEARLY_FULL  // %50-99 az yer
    } else {
      newStatus = ParkingStatus.AVAILABLE  // %0-49 müsait
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

  // Durum değiştirme
  const handleStatusChange = async (lot: ParkingLot, newStatus: ParkingStatus) => {
    try {
      await updateParkingLot(lot.id, { status: newStatus })
      showSuccess(`${lot.name} durumu "${getStatusText(newStatus)}" olarak güncellendi`)
    } catch {
      showError('Durum güncellenirken hata oluştu.')
    }
  }

  // Durum metni
  const getStatusText = (status: ParkingStatus) => {
    switch (status) {
      case ParkingStatus.AVAILABLE: return 'Müsait'
      case ParkingStatus.NEARLY_FULL: return 'Az Yer'
      case ParkingStatus.OCCUPIED: return 'Dolu'
      case ParkingStatus.MAINTENANCE: return 'Bakımda'
      case ParkingStatus.CLOSED: return 'Kapalı'
      case ParkingStatus.RESERVED: return 'Rezerve'
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

  const totalSpaces = parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0)
  const totalOccupied = parkingLots.reduce((sum, lot) => sum + lot.occupiedSpaces, 0)
  const averageOccupancy = totalSpaces > 0 ? Math.round((totalOccupied / totalSpaces) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
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
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
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

      {/* Admin Header */}
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
                onClick={handleSeedData}
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
                onClick={logout}
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

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Toplam Otopark</p>
                  <p className="text-4xl font-bold text-gray-900">{parkingLots.length}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Toplam Park Yeri</p>
                  <p className="text-4xl font-bold text-gray-900">{totalSpaces}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Dolu Park Yeri</p>
                  <p className="text-4xl font-bold text-gray-900">{totalOccupied}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Ortalama Doluluk</p>
                  <p className="text-4xl font-bold text-gray-900">%{averageOccupancy}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



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
          <Card className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-white/60 backdrop-blur-md border-b border-white/20 px-8 py-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <span>🏢 Otoparklar</span>
                </CardTitle>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowMapPicker(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base font-bold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    🗺️ Harita ile Ekle
                  </Button>
                <Button 
                    onClick={() => setShowNewForm(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base font-bold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                    ✏️ Manuel Ekle
                </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              
              <div className="w-full">
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
                                    onClick={() => handleQuickOccupancyUpdate(lot, -10)}
                                    disabled={lot.occupiedSpaces <= 0}
                                    className="w-8 h-7 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="10 araç çıktı"
                                  >
                                    -10
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, -5)}
                                    disabled={lot.occupiedSpaces <= 0}
                                    className="w-7 h-7 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="5 araç çıktı"
                                  >
                                    -5
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, -3)}
                                    disabled={lot.occupiedSpaces <= 0}
                                    className="w-7 h-7 text-xs font-medium bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="3 araç çıktı"
                                  >
                                    -3
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, -1)}
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
                                    onClick={() => handleQuickOccupancyUpdate(lot, 1)}
                                    disabled={lot.occupiedSpaces >= lot.totalSpaces}
                                    className="w-7 h-7 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="1 araç girdi"
                                  >
                                    +1
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, 3)}
                                    disabled={lot.occupiedSpaces >= lot.totalSpaces}
                                    className="w-7 h-7 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="3 araç girdi"
                                  >
                                    +3
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, 5)}
                                    disabled={lot.occupiedSpaces >= lot.totalSpaces}
                                    className="w-7 h-7 text-xs font-medium bg-emerald-500 dark:bg-emerald-600 text-white rounded hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="5 araç girdi"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, 10)}
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
                                    onClick={() => handleStatusChange(lot, status)}
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
                                onClick={() => setEditingLot(lot)}
                                className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all duration-200 flex items-center justify-center"
                                title="Düzenle"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(lot.id)}
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
            </CardContent>
          </Card>
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