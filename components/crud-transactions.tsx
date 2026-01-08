"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit2, Plus } from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
  user_id?: string
}

export function CrudTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Alimentación",
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
  })
  const { toast } = useToast()
  const supabase = createBrowserClient()

  // Cargar transacciones al montar
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error loading transactions:", error)
      toast({ title: "Error", description: "No se pudieron cargar las transacciones", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.description || !formData.amount) {
      toast({ title: "Error", description: "Complete todos los campos", variant: "destructive" })
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const transactionData = {
        description: formData.description,
        amount: formData.type === "expense" ? -Math.abs(Number(formData.amount)) : Number(formData.amount),
        category: formData.category,
        date: formData.date,
        type: formData.type,
        user_id: user.id,
      }

      if (editingId) {
        // Actualizar
        const { error } = await supabase.from("transactions").update(transactionData).eq("id", editingId)
        if (error) throw error
        toast({ title: "Éxito", description: "Transacción actualizada" })
      } else {
        // Crear
        const { error } = await supabase.from("transactions").insert([transactionData])
        if (error) throw error
        toast({ title: "Éxito", description: "Transacción creada" })
      }

      setFormData({
        description: "",
        amount: "",
        category: "Alimentación",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
      })
      setEditingId(null)
      setIsOpen(false)
      loadTransactions()
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast({ title: "Error", description: "No se pudo guardar la transacción", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Éxito", description: "Transacción eliminada" })
      loadTransactions()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({ title: "Error", description: "No se pudo eliminar la transacción", variant: "destructive" })
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      date: transaction.date.split("T")[0],
      type: transaction.type,
    })
    setEditingId(transaction.id)
    setIsOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>Gestiona tus ingresos y gastos</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  description: "",
                  amount: "",
                  category: "Alimentación",
                  date: new Date().toISOString().split("T")[0],
                  type: "expense",
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Nueva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nueva"} Transacción</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                    <SelectItem value="Alimentación">Alimentación</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as "income" | "expense" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Gasto</SelectItem>
                    <SelectItem value="income">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay transacciones</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-3 flex-1">
                  {t.type === "income" ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{t.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.category} • {t.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={t.type === "income" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                    {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
