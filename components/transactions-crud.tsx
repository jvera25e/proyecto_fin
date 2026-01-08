"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, MinusCircle, CalendarIcon, Trash2, Edit2 } from "lucide-react"
import { transactionsService } from "@/lib/supabase/services"
import { useToast } from "@/hooks/use-toast"
import type { Transaction } from "@/lib/supabase/types"

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

export function TransactionsCRUD() {
  const { toast } = useToast()
  const { data: transactions = [], mutate } = useSWR<Transaction[]>("transactions", () => transactionsService.getAll())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    account: "",
    date: new Date(),
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim() || !formData.amount || !formData.category || !formData.account) {
      toast({ title: "Error", description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    try {
      if (editingId) {
        await transactionsService.update(editingId, {
          description: formData.description,
          amount: type === "expense" ? -Number.parseFloat(formData.amount) : Number.parseFloat(formData.amount),
          category: formData.category,
          account: formData.account,
          date: formData.date.toISOString(),
          type,
          notes: formData.notes || undefined,
        })
        toast({ title: "Éxito", description: "Transacción actualizada" })
      } else {
        await transactionsService.create({
          description: formData.description,
          amount: type === "expense" ? -Number.parseFloat(formData.amount) : Number.parseFloat(formData.amount),
          category: formData.category,
          account: formData.account,
          date: formData.date.toISOString(),
          type,
          notes: formData.notes || undefined,
        })
        toast({ title: "Éxito", description: "Transacción creada" })
      }

      mutate()
      setFormData({ description: "", amount: "", category: "", account: "", date: new Date(), notes: "" })
      setEditingId(null)
      setIsCreateOpen(false)
      setIsEditOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la transacción", variant: "destructive" })
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setType(transaction.type)
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      account: transaction.account,
      date: new Date(transaction.date),
      notes: transaction.notes || "",
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await transactionsService.delete(id)
      mutate()
      toast({ title: "Éxito", description: "Transacción eliminada" })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la transacción", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transacciones</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Transacción</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  onClick={() => setType("expense")}
                  className="flex-1"
                >
                  <MinusCircle className="w-4 h-4 mr-2" /> Gasto
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  onClick={() => setType("income")}
                  className="flex-1"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Ingreso
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción"
                  />
                </div>
                <div>
                  <Label>Monto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date.toLocaleDateString()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Label>Cuenta</Label>
                  <Select
                    value={formData.account}
                    onValueChange={(value) => setFormData({ ...formData, account: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc} value={acc}>
                          {acc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? "Actualizar" : "Crear"} Transacción
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                      {transaction.type === "income" ? "Ingreso" : "Gasto"}
                    </Badge>
                    <span className="font-semibold">{transaction.description}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {transaction.category} • {transaction.account}
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className={`font-bold text-lg ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount > 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Eliminar Transacción</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar esta transacción?
                      </AlertDialogDescription>
                      <div className="flex gap-2">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(transaction.id)}>Eliminar</AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                onClick={() => setType("expense")}
                className="flex-1"
              >
                <MinusCircle className="w-4 h-4 mr-2" /> Gasto
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                onClick={() => setType("income")}
                className="flex-1"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Ingreso
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Monto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date.toLocaleDateString()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                    />
                  </PopoverContent>
                </Popover>
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
                <Label>Cuenta</Label>
                <Select
                  value={formData.account}
                  onValueChange={(value) => setFormData({ ...formData, account: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc} value={acc}>
                        {acc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Notas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Actualizar Transacción
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
