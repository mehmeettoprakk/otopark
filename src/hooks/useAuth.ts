import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'

// Admin email'ini environment variable'dan al, yoksa default kullan
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Sadece Firebase Auth ile giriş - güvenli yöntem
      const result = await signInWithEmailAndPassword(auth, email, password)
      setUser(result.user)
      return true
    } catch (error) {
      // Firebase error'larını sadece development modunda göster
      if (process.env.NODE_ENV === 'development') {
        console.warn('Authentication failed:', error)
      }
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      // Logout error'larını sadece development modunda göster
      if (process.env.NODE_ENV === 'development') {
        console.warn('Logout failed:', error)
      }
    }
  }

  // Kullanıcının admin olup olmadığını kontrol et
  // Güvenli yöntem: Sadece doğrulanmış Firebase kullanıcıları admin olabilir
  const isAdmin = user?.email === ADMIN_EMAIL
  const isAuthenticated = !!user && isAdmin

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout
  }
} 