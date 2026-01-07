"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun, UserIcon, Shield, Bell, Lock, Fingerprint, Camera, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface UserProfile {
  email: string
  name: string
  phone?: string
  avatar?: string
  biometricEnabled?: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  // Profile form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Settings state
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setName(parsedUser.name || "")
    setEmail(parsedUser.email || "")
    setPhone(parsedUser.phone || "")
    setBiometricEnabled(parsedUser.biometricEnabled || false)
    setAvatarPreview(parsedUser.avatar || "")
  }, [router])

  const handleSaveProfile = () => {
    if (!user) return

    const updatedUser = {
      ...user,
      name,
      email,
      phone,
    }

    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    alert("Perfil actualizado correctamente")
  }

  const handleEnableBiometric = async () => {
    // Simular registro biométrico
    if (!biometricEnabled) {
      // Check if browser supports WebAuthn
      if (window.PublicKeyCredential) {
        try {
          alert(
            "Iniciando registro biométrico...\n\nEn una aplicación real, esto activaría el sensor de huellas/Face ID de tu dispositivo.",
          )
          setBiometricEnabled(true)

          if (user) {
            const updatedUser = { ...user, biometricEnabled: true }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            setUser(updatedUser)
          }
        } catch (error) {
          console.error("Error al configurar biometría:", error)
          alert("No se pudo configurar la autenticación biométrica")
        }
      } else {
        alert("Tu navegador no soporta autenticación biométrica")
      }
    } else {
      setBiometricEnabled(false)
      if (user) {
        const updatedUser = { ...user, biometricEnabled: false }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Por favor completa todos los campos")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }

    // En una app real, aquí se verificaría la contraseña actual con el backend
    alert("Contraseña actualizada correctamente")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen debe ser menor a 2MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten imágenes")
        return
      }

      setAvatarFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)

        // Guardar en el usuario
        if (user) {
          const updatedUser = {
            ...user,
            avatar: reader.result as string,
          }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          setUser(updatedUser)
          alert("Foto de perfil actualizada correctamente")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (!user || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="glass border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Configuración</h1>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Perfil de Usuario
              </CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("avatar-upload")?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Cambiar foto
                  </Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG o GIF. Máx. 2MB</p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="btn-press">
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Seguridad
              </CardTitle>
              <CardDescription>Gestiona tu contraseña y autenticación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Biometric Authentication */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Autenticación Biométrica</h3>
                    <p className="text-sm text-muted-foreground">Usa huella digital o reconocimiento facial</p>
                    {biometricEnabled && (
                      <Badge variant="secondary" className="mt-1">
                        Activa
                      </Badge>
                    )}
                  </div>
                </div>
                <Switch checked={biometricEnabled} onCheckedChange={handleEnableBiometric} />
              </div>

              <Separator />

              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={showPassword} onCheckedChange={setShowPassword} id="show-password" />
                    <Label htmlFor="show-password" className="text-sm cursor-pointer">
                      Mostrar contraseñas
                    </Label>
                  </div>
                  <Button onClick={handleChangePassword} variant="secondary" className="btn-press">
                    Actualizar contraseña
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                Apariencia
              </CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {theme === "dark" ? (
                      <Moon className="w-6 h-6 text-primary" />
                    ) : (
                      <Sun className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Modo Oscuro</h3>
                    <p className="text-sm text-muted-foreground">
                      {theme === "dark" ? "Actualmente usando tema oscuro" : "Actualmente usando tema claro"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <h3 className="font-semibold">Notificaciones push</h3>
                  <p className="text-sm text-muted-foreground">Recibe alertas en tiempo real</p>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <h3 className="font-semibold">Notificaciones por email</h3>
                  <p className="text-sm text-muted-foreground">Recibe resúmenes semanales</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
