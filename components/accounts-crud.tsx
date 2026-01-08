"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Wallet, PiggyBank, CreditCard, TrendingUp, PlusCircle, Trash2, Edit2 } from "lucide-react"
import { accountsService } from "@/lib/supabase/services"
import { useToast } from "@/hooks/use-toast"
import type { Account } from "@/lib/supabase/types"

const accountTypes = [
  { value: "checking", label: "Cuenta Corriente", icon: Wallet },
  { value: "savings", label: "Cuenta de Ahorros", icon: PiggyBank },
  { value: "credit", label: "Tarjeta de Crédito", icon: CreditCard },
  { value: "investment", label: "Inversiones", icon: TrendingUp },
]

export function AccountsCRUD() {
  const { toast } = useToast()
  const { data: accounts = [], mutate } = useSWR<Account[]>("accounts", () => accountsService.getAll())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "checking" as const,
    balance: "",
    currency: "USD",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.type) {
      toast({ title: "Error", description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    try {
      if (editingId) {
        await accountsService.update(editingId, {
          name: formData.name,
          type: formData.type,
          balance: Number.parseFloat(formData.balance || "0"),
          currency: formData.currency,
        })
        toast({ title: "Éxito", description: "Cuenta actualizada" })
      } else {
        await accountsService.create({
          name: formData.name,
          type: formData.type,
          balance: Number.parseFloat(formData.balance || "0"),
          currency: formData.currency,
        })
        toast({ title: "Éxito", description: "Cuenta creada" })
      }

      mutate()
      setFormData({ name: "", type: "checking", balance: "", currency: "USD" })
      setEditingId(null)
      setIsCreateOpen(false)
      setIsEditOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la cuenta", variant: "destructive" })
    }
  }

  const handleEdit = (account: Account) => {
    setEditingId(account.id)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await accountsService.delete(id)
      mutate()
      toast({ title: "Éxito", description: "Cuenta eliminada" })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la cuenta", variant: "destructive" })
    }
  }

  const getTypeIcon = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type)
    return accountType ? accountType.icon : Wallet
  }

  const getTypeLabel = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type)
    return accountType ? accountType.label : type
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cuentas</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Cuenta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nombre de la Cuenta</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Mi Cuenta Principal"
                  />
                </div>
                <div>
                  <Label>Tipo de Cuenta</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Saldo Inicial</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Crear Cuenta
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-600">Saldo Total</p>
            <p className="text-3xl font-bold text-blue-900">${totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {accounts.map((account) => {
          const Icon = getTypeIcon(account.type)
          return (
            <Card key={account.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{account.name}</h3>
                      <Badge variant="outline">{getTypeLabel(account.type)}</Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        {account.currency} • Saldo: <span className="font-semibold">${account.balance.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Eliminar Cuenta</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar esta cuenta?
                        </AlertDialogDescription>
                        <div className="flex gap-2">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(account.id)}>Eliminar</AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
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
            <DialogTitle>Editar Cuenta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre de la Cuenta</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Tipo de Cuenta</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Moneda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Saldo</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Actualizar Cuenta
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
