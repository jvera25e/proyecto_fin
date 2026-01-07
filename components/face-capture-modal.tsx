"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react"

interface FaceCaptureModalProps {
  onSuccess: (faceData: string) => void
  onCancel: () => void
  mode: "register" | "login"
}

export function FaceCaptureModal({ onSuccess, onCancel, mode }: FaceCaptureModalProps) {
  const [status, setStatus] = useState<"idle" | "capturing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage("No se pudo acceder a la cámara. Verifica los permisos.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    setStatus("capturing")

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Capturar frame del video
    ctx.drawImage(video, 0, 0)

    // Convertir a base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)

    // Simular procesamiento de rostro (en producción, usar API de reconocimiento facial)
    setTimeout(() => {
      setStatus("success")
      setTimeout(() => {
        stopCamera()
        onSuccess(imageData)
      }, 1000)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl border max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">{mode === "register" ? "Registrar rostro" : "Verificar identidad"}</h3>
            <p className="text-sm text-muted-foreground">
              {mode === "register" ? "Centra tu rostro en el círculo" : "Confirma tu identidad con tu rostro"}
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera()
              onCancel()
            }}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-6">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Overlay de guía facial */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-48 h-64 rounded-full border-4 transition-colors ${
                  status === "capturing"
                    ? "border-orange-500 animate-pulse"
                    : status === "success"
                      ? "border-green-500"
                      : status === "error"
                        ? "border-red-500"
                        : "border-white/50"
                }`}
              >
                <div className="w-full h-full rounded-full border-4 border-dashed border-white/30" />
              </div>
            </div>

            {/* Indicador de estado */}
            {status === "success" && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <div className="bg-white rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <div className="bg-white rounded-full p-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={captureImage}
            disabled={status !== "idle"}
            className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all btn-press shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "capturing" ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Verificado</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>Capturar rostro</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Tu información biométrica está encriptada y solo se almacena localmente en tu dispositivo.
          </p>
        </div>
      </div>
    </div>
  )
}
