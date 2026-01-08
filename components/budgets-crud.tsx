"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Trash2, Edit2, Eye } from "lucide-react"
import { budgetsService } from "@/lib/supabase/services"
import { useToast } from "@/hooks/use-toast"
import type { Budget } from "@/lib/supabase/types"

const categories = [
  "Alimentación",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Compras",
  "Servicios",
  "Viajes",
  "Otros",
]

export function BudgetsCRUD() {
  const { toast } = useToast()
  const { data: budgets = [], mutate } = useSWR<Budget[]>("budgets", () => budgetsService.getAll())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    spent: "",
    period: "monthly" as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.amount) {
      toast({ title: "Error", description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    try {
      if (editingId) {
        await budgetsService.update(editingId, {
          category: formData.category,
          amount: Number.parseFloat(formData.amount),
          spent: Number.parseFloat(formData.spent || "0"),
          period: formData.period,
        })
        toast({ title: "Éxito", description: "Presupuesto actualizado" })
      } else {
        await budgetsService.create({
          category: formData.category,
          amount: Number.parseFloat(formData.amount),
          spent: Number.parseFloat(formData.spent || "0"),
          period: formData.period,
        })
        toast({ title: "Éxito", description: "Presupuesto creado" })
      }

      mutate()
      setFormData({ category: "", amount: "", spent: "", period: "monthly" })
      setEditingId(null)
      setIsCreateOpen(false)
      setIsEditOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el presupuesto", variant: "destructive" })
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id)
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      spent: budget.spent.toString(),
      period: budget.period,
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await budgetsService.delete(id)
      mutate()
      toast({ title: "Éxito", description: "Presupuesto eliminado" })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el presupuesto", variant: "destructive" })
    }
  }

  const getStatusColor = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Presupuestos</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Período</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData({ ...formData, period: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Monto Presupuestado</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Monto Gastado</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.spent}
                    onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Crear Presupuesto
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100
          return (
            <Card key={budget.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{budget.category}</h3>
                    <Badge variant="outline">{budget.period === "monthly" ? "Mensual" : "Anual"}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBudget(budget)
                        setIsDetailsOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Eliminar Presupuesto</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar este presupuesto?
                        </AlertDialogDescription>
                        <div className="flex gap-2">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(budget.id)}>Eliminar</AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">${budget.spent.toFixed(2)}</span>
                    <span className="text-gray-600">${budget.amount.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} />
                  <div className={`text-sm font-semibold ${getStatusColor(budget.spent, budget.amount)}`}>
                    {percentage.toFixed(0)}% utilizado
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Presupuesto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Período</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monto Presupuestado</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Monto Gastado</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Actualizar Presupuesto
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Presupuesto</DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedBudget.category}</h3>
                <Badge>{selectedBudget.period === "monthly" ? "Mensual" : "Anual"}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Presupuestado</p>
                  <p className="text-2xl font-bold">${selectedBudget.amount.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Gastado</p>
                  <p className="text-2xl font-bold">${selectedBudget.spent.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Utilización</span>
                  <span className="font-semibold">
                    {((selectedBudget.spent / selectedBudget.amount) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={Math.min((selectedBudget.spent / selectedBudget.amount) * 100, 100)} />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Saldo Disponible</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${(selectedBudget.amount - selectedBudget.spent).toFixed(2)}
                </p>
              </div>

              <Button onClick={() => setIsDetailsOpen(false)} className="w-full">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
