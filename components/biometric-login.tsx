"use client"

import { useState } from "react"
import { Fingerprint, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BiometricLoginProps {
  onSuccess: () => void
  onCancel: () => void
}

export function BiometricLogin({ onSuccess, onCancel }: BiometricLoginProps) {
  const [loading, setLoading] = useState(false)

  const handleBiometricAuth = async () => {
    setLoading(true)

    // Simular autenticación biométrica
    // En una app real, esto usaría la Web Authentication API (WebAuthn)
    try {
      if (window.PublicKeyCredential) {
        // Simular delay de autenticación
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // En producción, aquí iría:
        // const credential = await navigator.credentials.get({
        //   publicKey: {
        //     challenge: new Uint8Array([/* challenge from server */]),
        //     rpId: "example.com",
        //     allowCredentials: [/* registered credentials */],
        //     userVerification: "required",
        //   }
        // })

        onSuccess()
      } else {
        alert("Tu dispositivo no soporta autenticación biométrica")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error en autenticación biométrica:", error)
      alert("Error al autenticar. Intenta con contraseña.")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          {loading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Fingerprint className="w-8 h-8 text-white" />
          )}
        </div>
        <CardTitle>Autenticación Biométrica</CardTitle>
        <CardDescription>
          {loading ? "Autenticando..." : "Usa tu huella digital o Face ID para acceder"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleBiometricAuth}
          disabled={loading}
          className="w-full gradient-primary btn-press"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4 mr-2" />
              Autenticar
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="w-full btn-press bg-transparent" disabled={loading}>
          Usar contraseña
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          La autenticación biométrica mantiene tus datos seguros usando el hardware de tu dispositivo
        </p>
      </CardContent>
    </Card>
  )
}
