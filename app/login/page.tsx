"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, TrendingUp, Shield, CheckCircle } from "lucide-react"
import { FaceCaptureModal } from "@/components/face-capture-modal"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [formData, setFormData] = useState({
    email: "juan.perez@email.com",
    password: "password123",
    remember: true,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setShowFaceCapture(true)
  }

  const handleFaceVerificationSuccess = (faceData: string) => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: formData.email,
        name: "Juan Pérez",
        loginTime: new Date().toISOString(),
        biometricEnabled: true,
        loginMethod: "face",
      }),
    )
    router.push("/dashboard")
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
          loginTime: new Date().toISOString(),
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
        mode="login"
        onSuccess={handleFaceVerificationSuccess}
        onCancel={() => setShowFaceCapture(false)}
      />
    )
  }

  return (
    <div className="w-full h-screen flex">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary">
        <div className="absolute inset-0 gradient-mesh" />
      </div>

      {/* Form Section */}
      <div className="relative z-10 w-full lg:w-1/2 glass flex flex-col justify-center px-8 md:px-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MoneyFlow</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground">Accede a tu cuenta para gestionar tus finanzas</p>
        </div>

        <div className="flex gap-3 mb-5">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 p-3 glass border-2 border-border rounded-xl hover:border-primary/50 transition-all disabled:opacity-50"
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
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin("apple")}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 p-3 glass border-2 border-border rounded-xl hover:border-primary/50 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span className="text-sm font-medium">Apple</span>
          </button>
        </div>

        <div className="relative text-center my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="glass px-3 text-muted-foreground font-medium">o continúa con email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          {errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-10 py-3 glass border-2 rounded-xl text-sm transition-all ${
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-10 py-3 glass border-2 rounded-xl text-sm transition-all ${
                  errors.password ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                placeholder="••••••••"
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
          </div>

          <div className="flex items-center justify-between my-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              Recordarme
            </label>
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all btn-press shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Iniciar sesión con reconocimiento facial</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-semibold">
              Regístrate gratis
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 p-2 glass rounded-lg border text-xs text-muted-foreground">
          <Shield className="w-3 h-3 text-primary" />
          <span>Protegido con encriptación de nivel bancario</span>
        </div>
      </div>

      {/* Info Section - Hidden on mobile */}
      <div className="hidden lg:flex relative z-10 w-1/2 glass items-center justify-center p-16 border-l">
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="relative z-10 max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Control Total de tus Finanzas</h3>
            <p className="text-muted-foreground">
              Gestiona ingresos, gastos y metas con herramientas inteligentes de análisis.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass p-4 rounded-xl border text-center card-hover">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-xs text-muted-foreground">Usuarios</div>
            </div>
            <div className="glass p-4 rounded-xl border text-center card-hover">
              <div className="text-2xl font-bold text-primary">$2M+</div>
              <div className="text-xs text-muted-foreground">Gestionado</div>
            </div>
            <div className="glass p-4 rounded-xl border text-center card-hover">
              <div className="text-2xl font-bold text-primary">4.9★</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border mb-6">
            <p className="text-sm italic mb-4 text-muted-foreground">
              "MoneyFlow transformó completamente mi forma de manejar el dinero. Ahora tengo control total y puedo tomar
              mejores decisiones financieras."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                MG
              </div>
              <div>
                <div className="font-semibold">María González</div>
                <div className="text-sm text-muted-foreground">Empresaria</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Biométrico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
