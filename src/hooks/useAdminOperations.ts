import { useState } from 'react'
import { ParkingLot, ParkingStatus } from '@/types/parking'
import { useParkingLots } from '@/hooks/useFirebase'
import { useToast } from '@/hooks/useToast'
import { seedDatabase } from '@/utils/seedData'

interface UseAdminOperationsReturn {
  // State
  editingLot: ParkingLot | null
  isSeeding: boolean
  showMapPicker: boolean
  showNewForm: boolean
  newFormData: Partial<ParkingLot>
  
  // Actions
  setEditingLot: (lot: ParkingLot | null) => void
  setShowMapPicker: (show: boolean) => void
  setShowNewForm: (show: boolean) => void
  setNewFormData: (data: Partial<ParkingLot>) => void
  
  // Operations
  handleSave: (data: Partial<ParkingLot>) => Promise<void>
  handleEdit: (lot: ParkingLot) => void
  handleDelete: (id: string) => Promise<void>
  handleStatusChange: (id: string, status: ParkingStatus) => Promise<void>
  handleSeedDatabase: () => Promise<void>
  handleCancel: () => void
}

export function useAdminOperations(): UseAdminOperationsReturn {
  const { addParkingLot, updateParkingLot, deleteParkingLot } = useParkingLots()
  const { showError, showSuccess } = useToast()
  
  // State
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormData, setNewFormData] = useState<Partial<ParkingLot>>({})

  const handleSave = async (data: Partial<ParkingLot>) => {
    try {
      if (editingLot) {
        // Update existing parking lot
        await updateParkingLot(editingLot.id, data)
        showSuccess('Otopark başarıyla güncellendi!')
        setEditingLot(null)
      } else {
        // Add new parking lot
        await addParkingLot(data as Omit<ParkingLot, 'id' | 'createdAt' | 'updatedAt'>)
        showSuccess('Yeni otopark başarıyla eklendi!')
        setShowNewForm(false)
        setNewFormData({})
      }
    } catch (error) {
      showError('Otopark kaydedilirken hata oluştu.')
      console.error('Error saving parking lot:', error)
    }
  }

  const handleEdit = (lot: ParkingLot) => {
    setEditingLot(lot)
    setShowNewForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu otoparkı silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteParkingLot(id)
      showSuccess('Otopark başarıyla silindi!')
    } catch (error) {
      showError('Otopark silinirken hata oluştu.')
      console.error('Error deleting parking lot:', error)
    }
  }

  const handleStatusChange = async (id: string, status: ParkingStatus) => {
    try {
      await updateParkingLot(id, { status })
      showSuccess('Otopark durumu başarıyla güncellendi!')
    } catch (error) {
      showError('Otopark durumu güncellenirken hata oluştu.')
      console.error('Error updating parking lot status:', error)
    }
  }

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    try {
      const success = await seedDatabase()
      if (success) {
        showSuccess('Demo verileri başarıyla eklendi!')
      } else {
        showError('Demo verileri eklenirken hata oluştu.')
      }
    } catch (error) {
      showError('Demo verileri eklenirken hata oluştu.')
      console.error('Error seeding database:', error)
    } finally {
      setIsSeeding(false)
    }
  }

  const handleCancel = () => {
    setEditingLot(null)
    setShowNewForm(false)
    setNewFormData({})
    setShowMapPicker(false)
  }

  return {
    // State
    editingLot,
    isSeeding,
    showMapPicker,
    showNewForm,
    newFormData,
    
    // Actions
    setEditingLot,
    setShowMapPicker,
    setShowNewForm,
    setNewFormData,
    
    // Operations
    handleSave,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleSeedDatabase,
    handleCancel
  }
} 