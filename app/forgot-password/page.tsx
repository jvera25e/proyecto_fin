"use client"

import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4">Recuperar contraseña</h1>
        <p className="text-sm text-gray-600 mb-4">
          Esta funcionalidad aún no está disponible.
        </p>

        <Link
          href="/login"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
