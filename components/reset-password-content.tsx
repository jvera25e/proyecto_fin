"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Wallet, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: "Débil", color: "bg-red-500" }
      case 2:
        return { label: "Media", color: "bg-orange-500" }
      case 3:
        return { label: "Buena", color: "bg-yellow-500" }
      case 4:
        return { label: "Fuerte", color: "bg-green-500" }
      default:
        return { label: "Débil", color: "bg-red-500" }
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthInfo = getStrengthLabel(passwordStrength)

  useEffect(() => {
    const token = searchParams.get("code")
    if (!token) {
      setErrors({ general: "Enlace de recuperación inválido o expirado. Intenta nuevamente." })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const newErrors: { [key: string]: string } = {}

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setErrors({
        general:
          error.message || "Error al restablecer la contraseña. El enlace puede haber expirado. Intenta nuevamente.",
      })
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">¡Contraseña restablecida!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu contraseña ha sido actualizada correctamente. Te redirigiremos al inicio de sesión en segundos.
            </p>

            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Ir a inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Header with logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">JEVV</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Restablecer contraseña</h1>
            <p className="text-gray-600 dark:text-gray-400">Ingresa tu nueva contraseña</p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-11 pr-11 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-sm transition-all text-gray-900 dark:text-white ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{strengthInfo.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-11 pr-11 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-sm transition-all text-gray-900 dark:text-white ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Confirma tu nueva contraseña"
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Restablecer contraseña"
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
            <span>Protegido con encriptación de nivel bancario</span>
          </div>
        </div>
      </div>
    </div>
  )
}
