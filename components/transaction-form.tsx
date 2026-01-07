"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PlusCircle, MinusCircle, CalendarIcon, DollarSign, Tag, FileText, CreditCard } from "lucide-react"

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

interface TransactionFormProps {
  onAddTransaction: (transaction: any) => void
}

const categories = [
  "Alimentación",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Compras",
  "Servicios",
  "Viajes",
  "Inversiones",
  "Otros",
]

const accounts = ["Cuenta Corriente", "Cuenta de Ahorros", "Tarjeta de Crédito", "Efectivo", "PayPal"]

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    account: "",
    date: new Date(),
    notes: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación
    const newErrors: { [key: string]: string } = {}

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0"
    }

    if (!formData.category) {
      newErrors.category = "Selecciona una categoría"
    }

    if (!formData.account) {
      newErrors.account = "Selecciona una cuenta"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Crear transacción
    const transaction = {
      id: `trans_${Date.now()}`,
      description: formData.description,
      amount: type === "expense" ? -Number.parseFloat(formData.amount) : Number.parseFloat(formData.amount),
      category: formData.category,
      account: formData.account,
      date: formData.date.toISOString(),
      type,
      notes: formData.notes,
    }

    onAddTransaction(transaction)

    // Reset form
    setFormData({
      description: "",
      amount: "",
      category: "",
      account: "",
      date: new Date(),
      notes: "",
    })
    setErrors({})
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Nueva Transacción
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Transacción</DialogTitle>
          <DialogDescription>Registra un ingreso o gasto para mantener tu historial actualizado</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Transacción */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => setType("expense")}
              className="flex-1"
            >
              <MinusCircle className="w-4 h-4 mr-2" />
              Gasto
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => setType("income")}
              className="flex-1"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Ingreso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descripción */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="pl-10"
                  placeholder="ej. Compra en supermercado, Salario mensual..."
                />
              </div>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Monto */}
            <div>
              <Label htmlFor="amount">Monto *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            {/* Fecha */}
            <div>
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Categoría */}
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Cuenta */}
            <div>
              <Label htmlFor="account">Cuenta *</Label>
              <Select
                value={formData.account}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, account: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {account}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account}</p>}
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Información adicional sobre esta transacción..."
                rows={3}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Vista Previa:</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {type === "income" ? "Ingreso" : "Gasto"}
                </Badge>
                <span className="font-medium">{formData.description || "Descripción"}</span>
              </div>
              <div className={`font-bold text-lg ${type === "income" ? "text-green-600" : "text-red-600"}`}>
                {type === "income" ? "+" : "-"}${formData.amount || "0.00"}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {formData.category && <span>📁 {formData.category}</span>}
              {formData.account && <span className="ml-4">💳 {formData.account}</span>}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              <PlusCircle className="w-4 h-4 mr-2" />
              Agregar Transacción
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
