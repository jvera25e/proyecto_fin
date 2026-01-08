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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PlusCircle, CalendarIcon, Trash2, Edit2 } from "lucide-react"
import { goalsService } from "@/lib/supabase/services"
import { useToast } from "@/hooks/use-toast"
import type { FinancialGoal } from "@/lib/supabase/types"

const categories = ["Fondo de Emergencia", "Vacaciones", "Compra", "Inversión", "Pagar Deuda", "Otro"]
const priorities = ["high", "medium", "low"]

export function GoalsCRUD() {
  const { toast } = useToast()
  const { data: goals = [], mutate } = useSWR<FinancialGoal[]>("goals", () => goalsService.getAll())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    deadline: new Date(),
    category: "",
    priority: "medium" as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.target_amount || !formData.category) {
      toast({ title: "Error", description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    try {
      if (editingId) {
        await goalsService.update(editingId, {
          name: formData.name,
          target_amount: Number.parseFloat(formData.target_amount),
          current_amount: Number.parseFloat(formData.current_amount || "0"),
          deadline: formData.deadline.toISOString(),
          category: formData.category,
          priority: formData.priority,
        })
        toast({ title: "Éxito", description: "Meta actualizada" })
      } else {
        await goalsService.create({
          name: formData.name,
          target_amount: Number.parseFloat(formData.target_amount),
          current_amount: Number.parseFloat(formData.current_amount || "0"),
          deadline: formData.deadline.toISOString(),
          category: formData.category,
          priority: formData.priority,
          status: "active",
        })
        toast({ title: "Éxito", description: "Meta creada" })
      }

      mutate()
      setFormData({
        name: "",
        target_amount: "",
        current_amount: "",
        deadline: new Date(),
        category: "",
        priority: "medium",
      })
      setEditingId(null)
      setIsCreateOpen(false)
      setIsEditOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la meta", variant: "destructive" })
    }
  }

  const handleEdit = (goal: FinancialGoal) => {
    setEditingId(goal.id)
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: new Date(goal.deadline),
      category: goal.category,
      priority: goal.priority,
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await goalsService.delete(id)
      mutate()
      toast({ title: "Éxito", description: "Meta eliminada" })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la meta", variant: "destructive" })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Metas Financieras</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nueva Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nombre de la Meta</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Fondo de emergencia"
                  />
                </div>
                <div>
                  <Label>Monto Objetivo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Monto Actual</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  />
                </div>
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
                  <Label>Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha Límite</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline.toLocaleDateString()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        selected={formData.deadline}
                        onSelect={(date) => date && setFormData({ ...formData, deadline: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Crear Meta
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
        {goals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100
          return (
            <Card key={goal.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge>{goal.category}</Badge>
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority === "high" ? "Alta" : goal.priority === "medium" ? "Media" : "Baja"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Eliminar Meta</AlertDialogTitle>
                        <AlertDialogDescription>¿Estás seguro de que deseas eliminar esta meta?</AlertDialogDescription>
                        <div className="flex gap-2">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(goal.id)}>Eliminar</AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${goal.current_amount.toFixed(2)}</span>
                    <span className="text-gray-600">${goal.target_amount.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} />
                  <div className="text-sm text-gray-600">{progress.toFixed(0)}% completada</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre de la Meta</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Monto Objetivo</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Monto Actual</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                />
              </div>
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
                <Label>Prioridad</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha Límite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline.toLocaleDateString()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      selected={formData.deadline}
                      onSelect={(date) => date && setFormData({ ...formData, deadline: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Actualizar Meta
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
