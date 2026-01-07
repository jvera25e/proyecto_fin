"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, ArrowRight, Shield, CheckCircle } from "lucide-react"
import { FaceCaptureModal } from "@/components/face-capture-modal"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@email.com",
    password: "MySecurePass123!",
    confirmPassword: "MySecurePass123!",
    acceptTerms: true,
    acceptMarketing: true,
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
        return { label: "Débil", class: "weak" }
      case 2:
        return { label: "Media", class: "medium" }
      case 3:
        return { label: "Buena", class: "good" }
      case 4:
        return { label: "Fuerte", class: "strong" }
      default:
        return { label: "Débil", class: "weak" }
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthInfo = getStrengthLabel(passwordStrength)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validación
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
    <div className="w-full h-screen flex">
      <div className="absolute inset-0 gradient-primary">
        <div className="absolute inset-0 gradient-mesh" />
      </div>

      {/* Form Section */}
      <div className="relative z-10 w-1/2 glass flex flex-col justify-center px-12 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MoneyFlow</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm">Comienza tu viaje hacia la libertad financiera</p>
        </div>

        {/* Benefits */}
        <div className="flex justify-between mb-5 p-3 glass rounded-lg border">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle className="w-3 h-3 text-primary" />
            Gratis para siempre
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle className="w-3 h-3 text-primary" />
            Sin tarjeta requerida
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle className="w-3 h-3 text-primary" />
            Setup en 2 minutos
          </div>
        </div>

        {/* Social Login */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex-1 flex items-center justify-center gap-2 p-3 glass border-2 border-border rounded-lg hover:border-primary/50 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 2.43-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin("apple")}
            className="flex-1 flex items-center justify-center gap-2 p-3 glass border-2 border-border rounded-lg hover:border-primary/50 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span className="text-sm font-medium">Apple</span>
          </button>
        </div>

        <div className="relative text-center my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="glass px-3 text-muted-foreground font-medium">o crea tu cuenta</span>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          {errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 glass border-2 rounded-lg text-sm transition-all ${
                    errors.firstName
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  placeholder="Juan"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Apellido</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 glass border-2 rounded-lg text-sm transition-all ${
                    errors.lastName
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  placeholder="Pérez"
                />
              </div>
              {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-10 py-3 glass border-2 rounded-lg text-sm transition-all ${
                  errors.email
                    ? "border-destructive focus:border-destructive"
                    : formData.email && !errors.email
                      ? "border-primary focus:border-primary"
                      : "border-border focus:border-primary"
                } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                placeholder="tu@email.com"
              />
              {formData.email && !errors.email && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
              )}
            </div>
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            {formData.email && !errors.email && <p className="mt-1 text-xs text-primary">✓ Email disponible</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-10 py-3 glass border-2 rounded-lg text-sm transition-all ${
                  errors.password ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}

            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strengthInfo.class === "weak"
                          ? "bg-red-500 w-1/4"
                          : strengthInfo.class === "medium"
                            ? "bg-orange-500 w-2/4"
                            : strengthInfo.class === "good"
                              ? "bg-yellow-500 w-3/4"
                              : "bg-green-500 w-full"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      strengthInfo.class === "strong" ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    Contraseña {strengthInfo.label.toLowerCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmar contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full pl-10 pr-10 py-3 glass border-2 rounded-lg text-sm transition-all ${
                  errors.confirmPassword
                    ? "border-destructive focus:border-destructive"
                    : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-primary focus:border-primary"
                      : "border-border focus:border-primary"
                } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                placeholder="Confirma tu contraseña"
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
              )}
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary mt-0.5"
              />
              <span>
                Acepto los{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 font-medium">
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium">
                  política de privacidad
                </Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={formData.acceptMarketing}
                onChange={(e) => setFormData({ ...formData, acceptMarketing: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              Recibir actualizaciones y ofertas por email
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all btn-press shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Crear cuenta gratis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="relative z-10 w-1/2 glass flex items-center justify-center p-16 border-l">
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="relative z-10 max-w-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Únete a 50K+ Usuarios</h3>
            <p className="text-muted-foreground text-sm">
              Miles de personas ya confían en MoneyFlow para gestionar sus finanzas inteligentemente.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">Análisis IA</h4>
                <p className="text-xs text-gray-400">Patrones de gasto inteligentes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">Seguridad Bancaria</h4>
                <p className="text-xs text-gray-400">Encriptación militar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">Sync Automático</h4>
                <p className="text-xs text-gray-400">10,000+ bancos conectados</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Shield className="w-3 h-3 text-green-400" />
              SOC 2
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Lock className="w-3 h-3 text-green-400" />
              256-bit SSL
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
