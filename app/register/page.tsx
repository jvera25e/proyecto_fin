"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Wallet, ArrowRight, CheckCircle } from "lucide-react"
import { FaceCaptureModal } from "@/components/face-capture-modal"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido"
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido"

    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setShowFaceCapture(true)
  }

  const handleFaceCaptureSuccess = async (faceData: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          registrationTime: new Date().toISOString(),
          faceData: faceData.substring(0, 100),
          biometricEnabled: true,
        }),
      )

      router.push("/dashboard")
    } catch (error) {
      setErrors({ general: "Error al crear la cuenta. Intenta nuevamente." })
      setShowFaceCapture(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: `user@${provider}.com`,
          name: `Usuario ${provider}`,
          registrationTime: new Date().toISOString(),
          provider: provider,
        }),
      )

      router.push("/dashboard")
    } catch (error) {
      setErrors({ general: `Error al conectar con ${provider}` })
    } finally {
      setIsLoading(false)
    }
  }

  if (showFaceCapture) {
    return (
      <FaceCaptureModal
        mode="register"
        onSuccess={handleFaceCaptureSuccess}
        onCancel={() => setShowFaceCapture(false)}
      />
    )
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-h-[90vh] overflow-y-auto">
          {/* Header with clickable logo */}
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">JEVV</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Crea tu cuenta</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Con reconocimiento facial</p>
          </div>

          <button
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 p-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all disabled:opacity-50 mb-5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Continuar con Google</span>
          </button>

          <div className="relative text-center my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-medium">
                o crea tu cuenta
              </span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border-2 rounded-lg text-sm transition-all text-gray-900 dark:text-white ${
                      errors.firstName
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Juan"
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Apellido</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border-2 rounded-lg text-sm transition-all text-gray-900 dark:text-white ${
                      errors.lastName
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Pérez"
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-sm transition-all text-gray-900 dark:text-white ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Contraseña</label>
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
                  placeholder="Confirma tu contraseña"
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Acepto los{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    términos y condiciones
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.acceptTerms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Crear cuenta gratis</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
