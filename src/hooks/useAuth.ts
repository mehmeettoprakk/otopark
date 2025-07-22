import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User, AuthError } from 'firebase/auth'

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

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Basit validasyon
      if (!email.trim() || !password.trim()) {
        return {
          success: false,
          message: 'Email ve şifre alanları boş bırakılamaz'
        }
      }

      // Firebase Auth ile giriş
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Admin kontrolü
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth) // Admin değilse çıkış yap
        return {
          success: false,
          message: 'Bu hesap admin yetkilerine sahip değil'
        }
      }

      setUser(result.user)
      return {
        success: true,
        message: 'Giriş başarılı! Hoş geldiniz'
      }
    } catch (error) {
      // Firebase error'larını kullanıcı dostu mesajlara çevir
      let errorMessage = 'Giriş yapılırken hata oluştu'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as AuthError
        
        if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Geçersiz email adresi'
        } else if (firebaseError.code === 'auth/user-disabled') {
          errorMessage = 'Bu hesap devre dışı bırakılmış'
        } else if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'Yanlış şifre girdiniz'
        } else if (firebaseError.code === 'auth/invalid-credential') {
          errorMessage = 'Email veya şifre hatalı'
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin'
        }
      }

      // Development modunda detaylı hata bilgisi göster
      if (process.env.NODE_ENV === 'development') {
        console.warn('Authentication failed:', error)
      }
      
      return {
        success: false,
        message: errorMessage
      }
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