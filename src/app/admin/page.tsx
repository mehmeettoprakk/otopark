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
  lot?: ParkingLot
  onSave: (data: Partial<ParkingLot>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: lot?.name || '',
    address: lot?.address || '',
    latitude: lot?.latitude || 0,
    longitude: lot?.longitude || 0,
    totalSpaces: lot?.totalSpaces || 0,
    hourlyRate: lot?.hourlyRate || 0,
    isActive: lot?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      occupiedSpaces: lot?.occupiedSpaces || 0
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lot ? 'Otoparkı Düzenle' : 'Yeni Otopark Ekle'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otopark Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Toplam Park Yeri
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalSpaces}
                onChange={(e) => setFormData({...formData, totalSpaces: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enlem (Latitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Boylam (Longitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saatlik Ücret (₺)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Aktif
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {lot ? 'Güncelle' : 'Ekle'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
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
  const [showForm, setShowForm] = useState(false)
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    // Gerçek zamanlı simülasyon başlat
    if (parkingLots.length > 0) {
      simulateOccupancyChanges()
    }
  }, [parkingLots.length])

  const handleSave = async (data: Partial<ParkingLot>) => {
    try {
      if (editingLot) {
        await updateParkingLot(editingLot.id, data)
        showSuccess('Otopark başarıyla güncellendi!')
      } else {
        await addParkingLot(data as Omit<ParkingLot, 'id' | 'createdAt' | 'updatedAt'>)
        showSuccess('Yeni otopark başarıyla eklendi!')
      }
      setShowForm(false)
      setEditingLot(null)
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
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-xl mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-white/70 text-sm">Otopark yönetimi ve istatistikler</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={handleSeedData}
                disabled={isSeeding}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Database className="h-4 w-4 mr-2" />
                {isSeeding ? 'Ekleniyor...' : 'Demo Veriler'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Ana Sayfa
              </Button>
              <Button 
                variant="ghost" 
                onClick={logout}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Otopark</p>
                  <p className="text-3xl font-bold text-gray-900">{parkingLots.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Car className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="slide-up" style={{"animationDelay": "0.1s"}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Park Yeri</p>
                  <p className="text-3xl font-bold text-gray-900">{totalSpaces}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="slide-up" style={{"animationDelay": "0.2s"}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Dolu Park Yeri</p>
                  <p className="text-3xl font-bold text-gray-900">{totalOccupied}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="slide-up" style={{"animationDelay": "0.3s"}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ortalama Doluluk</p>
                  <p className="text-3xl font-bold text-gray-900">%{averageOccupancy}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form veya Otopark Listesi */}
        {showForm || editingLot ? (
          <ParkingLotForm
            lot={editingLot || undefined}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingLot(null)
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Otoparklar</CardTitle>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Otopark Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Otopark
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doluluk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ücret
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Güncelleme
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parkingLots.map((lot) => {
                      const occupancyPercentage = calculateOccupancyPercentage(lot.occupiedSpaces, lot.totalSpaces)
                      return (
                        <tr key={lot.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lot.name}</div>
                              <div className="text-sm text-gray-500">{lot.address}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {lot.occupiedSpaces}/{lot.totalSpaces} (%{occupancyPercentage})
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  occupancyPercentage >= 90 ? 'bg-red-600' :
                                  occupancyPercentage >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${occupancyPercentage}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lot.hourlyRate} ₺/saat
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lot.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {lot.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(lot.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingLot(lot)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="danger"
                                onClick={() => handleDelete(lot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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