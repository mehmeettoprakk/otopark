'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useParkingLots } from '@/hooks/useFirebase'
import { useToast } from '@/hooks/useToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ToastContainer } from '@/components/ui/Toast'
import { ParkingLot } from '@/types/parking'
import { formatDate, calculateOccupancyPercentage } from '@/lib/utils'
import { seedDatabase, simulateOccupancyChanges } from '@/utils/seedData'
import { Plus, Edit, Trash2, Car, Users, BarChart3, LogOut, Database } from 'lucide-react'
import dynamic from 'next/dynamic'

// FullPageLocationPicker'ı dinamik import et (SSR problemini önlemek için)
const FullPageLocationPicker = dynamic(() => import('@/components/Map/FullPageLocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-50">
      <div className="text-gray-500 text-xl">Harita yükleniyor...</div>
    </div>
  )
})

// Giriş formu bileşeni
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showError, toasts, removeToast } = useToast()

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
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Paneli</CardTitle>
          <p className="text-white/70 mt-2">Güvenli giriş yapın</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Adresi
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="example@otopark.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-amber-500/20 border border-amber-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-amber-900 text-xs font-bold">🔒</span>
                </div>
              </div>
              <div>
                <h4 className="text-amber-100 font-semibold text-sm mb-1"> Lütfen Firebase Authentication konsolundan giriş yapınız.</h4>
                <p className="text-amber-200 text-xs leading-relaxed">
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
    occupiedSpaces: lot?.occupiedSpaces?.toString() || '0',
    hourlyRate: lot?.hourlyRate?.toString() || '',
    isActive: lot?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      totalSpaces: parseInt(formData.totalSpaces) || 0,
      occupiedSpaces: parseInt(formData.occupiedSpaces) || 0,
      hourlyRate: parseFloat(formData.hourlyRate) || 0
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lot ? 'Otoparkı Düzenle' : 'Yeni Otopark Ekle'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                <span className="text-blue-600">🏢</span>
                <span>Otopark Adı</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                placeholder="Örn: Taksim Meydanı Otoparkı"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                <span className="text-green-600">🚗</span>
                <span>Toplam Park Yeri Sayısı</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalSpaces}
                onChange={(e) => setFormData({...formData, totalSpaces: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                placeholder="Örn: 150"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                <span className="text-orange-600">🅿️</span>
                <span>Şu An Dolu Park Yeri</span>
              </label>
              <input
                type="number"
                min="0"
                max={parseInt(formData.totalSpaces) || 999}
                value={formData.occupiedSpaces}
                onChange={(e) => setFormData({...formData, occupiedSpaces: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                placeholder="Örn: 75"
              />
              <p className="text-sm text-gray-600 mt-2 bg-blue-50 p-2 rounded-md border border-blue-200">
                💡 <strong>İpucu:</strong> Otoparka araç geldiğinde/gittiğinde bu sayıyı güncelleyin
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                <span className="text-purple-600">📍</span>
                <span>Otopark Adresi</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                placeholder="Örn: Taksim Meydanı, Beyoğlu/İstanbul"
                required
              />
            </div>
            {formData.latitude && formData.longitude ? (
              <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-300 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">📍</span>
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
                  <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                    <span className="text-red-600">🌍</span>
                    <span>Enlem (Latitude)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                    placeholder="Örn: 41.0369"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                    <span className="text-red-600">🌍</span>
                    <span>Boylam (Longitude)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                    placeholder="Örn: 28.9852"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                <span className="text-yellow-600">💰</span>
                <span>Saatlik Ücret (₺)</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                placeholder="Örn: 25.50"
                required
              />
            </div>
            <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
              />
              <label htmlFor="isActive" className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span>Otopark Aktif (Kullanıma Açık)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button type="submit" className="flex-1 py-3 text-lg font-semibold">
              {lot ? '✏️ Güncelle' : '➕ Ekle'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-3 text-lg font-semibold">
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

  useEffect(() => {
    // Gerçek zamanlı simülasyon başlat
    if (parkingLots.length > 0) {
      simulateOccupancyChanges()
    }
  }, [parkingLots.length])

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
    } catch (err) {
      console.error('Kaydetme hatası:', err)
      showError('Otopark kaydedilirken hata oluştu.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu otoparkı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteParkingLot(id)
        showSuccess('Otopark başarıyla silindi!')
      } catch (err) {
        console.error('Silme hatası:', err)
        showError('Otopark silinirken hata oluştu.')
      }
    }
  }

  // Hızlı doluluk güncelleme
  const handleQuickOccupancyUpdate = async (lot: ParkingLot, change: number) => {
    const newOccupiedSpaces = Math.max(0, Math.min(lot.totalSpaces, lot.occupiedSpaces + change))
    
    try {
      await updateParkingLot(lot.id, { occupiedSpaces: newOccupiedSpaces })
      showSuccess(`${lot.name} doluluk güncellendi: ${newOccupiedSpaces}/${lot.totalSpaces}`)
    } catch (err) {
      console.error('Doluluk güncelleme hatası:', err)
      showError('Doluluk güncellenirken hata oluştu.')
    }
  }

  const handleSeedData = async () => {
    if (confirm('Demo verileri eklensin mi? Bu işlem mevcut verilerin üzerine yazabilir.')) {
      setIsSeeding(true)
      try {
        await seedDatabase()
        showSuccess('Demo verileri başarıyla eklendi!')
      } catch (err) {
        console.error('Demo veri ekleme hatası:', err)
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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center glass p-8 rounded-2xl">
          <div className="loading-spinner h-16 w-16 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Admin Panel Yükleniyor</h2>
          <p className="text-white/80">Veriler hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Admin Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white">
                  <div className="w-full h-full bg-orange-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-purple-100 bg-clip-text">
                  Admin Panel
                </h1>
                <p className="text-white/80 text-sm font-medium">
                  Otopark yönetimi ve istatistikler
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="secondary" 
                onClick={handleSeedData}
                disabled={isSeeding}
                className="bg-amber-500/20 border-amber-400/30 text-amber-100 hover:bg-amber-400/30 backdrop-blur-sm"
              >
                <Database className="h-4 w-4 mr-2" />
                {isSeeding ? 'Ekleniyor...' : 'Demo Veriler'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = '/'}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                Ana Sayfa
              </Button>
              <Button 
                variant="secondary" 
                onClick={logout}
                className="bg-red-500/20 border-red-400/30 text-red-100 hover:bg-red-400/30 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8">
        {/* Modern İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <Card className="card-elevated slide-up hover:scale-105 transition-transform duration-300 h-full">
            <CardContent className="p-6 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Toplam Otopark</p>
                  <p className="text-4xl font-bold text-slate-900 leading-tight">{parkingLots.length}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated slide-up hover:scale-105 transition-transform duration-300 h-full" style={{"animationDelay": "0.1s"}}>
            <CardContent className="p-6 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Toplam Park Yeri</p>
                  <p className="text-4xl font-bold text-slate-900 leading-tight">{totalSpaces}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated slide-up hover:scale-105 transition-transform duration-300 h-full" style={{"animationDelay": "0.2s"}}>
            <CardContent className="p-6 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Dolu Park Yeri</p>
                  <p className="text-4xl font-bold text-slate-900 leading-tight">{totalOccupied}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated slide-up hover:scale-105 transition-transform duration-300 h-full" style={{"animationDelay": "0.3s"}}>
            <CardContent className="p-6 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Ortalama Doluluk</p>
                  <p className="text-4xl font-bold text-slate-900 leading-tight">%{averageOccupancy}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl shadow-lg flex items-center justify-center">
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
          <Card className="card-elevated slide-up hover:shadow-2xl transition-all duration-500 bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <span>🏢 Otoparklar</span>
                </CardTitle>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowMapPicker(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    🗺️ Harita ile Ekle
                  </Button>
                  <Button 
                    onClick={() => setShowNewForm(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    ✏️ Manuel Ekle
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              
              <div className="w-full">
                <table className="w-full table-fixed">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="w-[22%] px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        🏢 Otopark
                      </th>
                      <th className="w-[35%] px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        🚗 Doluluk & Güncelleme
                      </th>
                      <th className="w-[12%] px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        💰 Ücret
                      </th>
                      <th className="w-[10%] px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        📊 Durum
                      </th>
                      <th className="w-[11%] px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        🕒 Güncelleme
                      </th>
                      <th className="w-[10%] px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                        ⚡ İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {parkingLots.map((lot, index) => {
                      const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
                      return (
                        <tr key={lot.id} className="hover:bg-gray-50 transition-all duration-300 hover:shadow-lg table-row-enter border-b border-gray-100 last:border-b-0" style={{animationDelay: `${index * 0.1}s`}}>
                          <td className="px-6 py-4 align-top">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <Car className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900 truncate">{lot.name}</div>
                                <div className="text-xs text-gray-600 truncate">{lot.address}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="mb-3">
                              <div className="text-sm font-bold text-gray-900 mb-2">
                                {lot.occupiedSpaces}/{lot.totalSpaces} (%{occupancyPercentage})
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-3 shadow-inner">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-700 ${
                                    occupancyPercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                    occupancyPercentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                                  }`}
                                  style={{ width: `${occupancyPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 p-1 bg-red-50 rounded-lg">
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, -10)}
                                    disabled={lot.occupiedSpaces <= 0}
                                    className="w-8 h-6 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="10 araç çıktı"
                                  >
                                    -10
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, -5)}
                                    disabled={lot.occupiedSpaces <= 0}
                                    className="w-7 h-6 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="5 araç çıktı"
                                  >
                                    -5
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, -3)}
                                    disabled={lot.occupiedSpaces <= 0}
                                    className="w-7 h-6 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="3 araç çıktı"
                                  >
                                    -3
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, -1)}
                                    disabled={lot.occupiedSpaces <= 0}
                                    className="w-7 h-6 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="1 araç çıktı"
                                  >
                                    -1
                                  </button>
                                </div>
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                <div className="flex items-center gap-1 p-1 bg-green-50 rounded-lg">
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, 1)}
                                    disabled={lot.occupiedSpaces >= lot.totalSpaces}
                                    className="w-7 h-6 text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="1 araç girdi"
                                  >
                                    +1
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, 3)}
                                    disabled={lot.occupiedSpaces >= lot.totalSpaces}
                                    className="w-7 h-6 text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="3 araç girdi"
                                  >
                                    +3
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, 5)}
                                    disabled={lot.occupiedSpaces >= lot.totalSpaces}
                                    className="w-7 h-6 text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="5 araç girdi"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => handleQuickOccupancyUpdate(lot, 10)}
                                    disabled={lot.occupiedSpaces >= lot.totalSpaces}
                                    className="w-8 h-6 text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105"
                                    title="10 araç girdi"
                                  >
                                    +10
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">₺</span>
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                {lot.hourlyRate}₺
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full shadow-lg transition-all duration-300 ${
                              lot.isActive 
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300' 
                                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                lot.isActive ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              {lot.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="text-xs font-medium text-gray-700">
                              {formatDate(lot.updatedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top text-right">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => setEditingLot(lot)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                                title="Düzenle"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(lot.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4" />
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
      
      {/* Tam Sayfa Harita Seçici */}
      {showMapPicker && (
        <FullPageLocationPicker
          onLocationSelect={(location) => {
            // Seçilen konumla form verilerini hazırla
            const formData = {
              name: location.name || '',
              address: location.address,
              latitude: location.lat,
              longitude: location.lng,
              totalSpaces: 100, // Varsayılan park yeri sayısını artırdım
              occupiedSpaces: 0,
              hourlyRate: 15, // Varsayılan ücreti düşürdüm
              isActive: true
            }
            
            setNewFormData(formData)
            setShowMapPicker(false)
            setShowNewForm(true)
          }}
          onCancel={() => setShowMapPicker(false)}
        />
      )}
    </div>
  )
}

export default function AdminPage() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <AdminDashboard /> : <LoginForm />
}