'use client'

import React from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { ToastMessage } from '@/hooks/useToast'

interface ToastProps {
  toast: ToastMessage
  onRemove: (id: string) => void
}

const Toast = ({ toast, onRemove }: ToastProps) => {
  const { id, message, type } = toast

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  }

  const styles = {
    success: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
    warning: 'bg-yellow-500 border-yellow-400',
    info: 'bg-blue-500 border-blue-400'
  }

  return (
    <div className={`
      ${styles[type]} 
      border backdrop-blur-sm
      rounded-xl p-4 shadow-lg
      transform transition-all duration-300 ease-in-out
      flex items-center justify-between
      min-w-[300px] max-w-[400px]
      animate-in slide-in-from-right-full
    `}>
      <div className="flex items-center space-x-3">
        <div className="text-white">
          {icons[type]}
        </div>
        <p className="text-white font-medium text-sm">{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-white hover:text-gray-200 transition-colors ml-4"
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default Toast 