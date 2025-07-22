import React, { useState } from 'react'
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useDarkMode } from '@/hooks/useDarkMode'

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()
  const { showError } = useToast()
  const { isDarkMode } = useDarkMode()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (error) {
      showError('Giriş yapılırken hata oluştu. Lütfen bilgilerinizi kontrol edin.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-300 ${
      isDarkMode 
        ? 'from-gray-900 via-slate-900 to-indigo-900' 
        : 'from-blue-50 via-indigo-50 to-purple-50'
    } flex items-center justify-center p-4`}>
      <Card className={`w-full max-w-md backdrop-blur-xl border rounded-2xl shadow-2xl transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-700/50' 
          : 'bg-white/90 border-white/50'
      }`}>
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Admin Paneli
          </CardTitle>
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Otopark yönetim sistemine giriş yapın
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700/80 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="example@otopark.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700/80 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Giriş Yapılıyor...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Giriş Yap
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 