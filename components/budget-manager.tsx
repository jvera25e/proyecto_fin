"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlusCircle, AlertTriangle, CheckCircle, DollarSign, Target, Settings, Trash2, Eye } from "lucide-react"
import { BudgetManager, type Budget, type BudgetAlert } from "@/lib/budget-manager"
import { formatCurrency } from "@/lib/ai-recommendations"

interface BudgetManagerComponentProps {
  transactions: any[]
  userId: string
}

export function BudgetManagerComponent({ transactions, userId }: BudgetManagerComponentProps) {
  const [budgetManager] = useState(() => new BudgetManager([], transactions))
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: "",
    period: "monthly" as "monthly" | "weekly" | "yearly",
  })
  const [loading, setLoading] = useState(true)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null)

  useEffect(() => {
    const loadBudgets = () => {
      const storedBudgets = localStorage.getItem(`budgets_${userId}`)
      const budgetsData = storedBudgets ? JSON.parse(storedBudgets) : []

      const categorySpending: { [key: string]: number } = {}
      transactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          const cat = t.category
          categorySpending[cat] = (categorySpending[cat] || 0) + Math.abs(t.amount)
        })

      const formattedBudgets: Budget[] = budgetsData.map((b: any) => {
        const spent = categorySpending[b.category] || 0
        const percentage = (spent / Number(b.limit)) * 100

        let status: Budget["status"] = "on_track"
        if (percentage >= 100) status = "exceeded"
        else if (percentage >= 80) status = "warning"

        return {
          id: b.id,
          category: b.category,
          limit: Number(b.limit),
          spent,
          period: b.period as "monthly" | "weekly" | "yearly",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          status,
          notifications: true,
        }
      })

      setBudgets(formattedBudgets)

      const budgetManagerWithData = new BudgetManager(formattedBudgets, transactions)
      const generatedAlerts = budgetManagerWithData.generateAlerts()
      setAlerts(generatedAlerts)

      setLoading(false)
    }

    loadBudgets()
  }, [transactions, userId])

  const saveBudgets = (newBudgets: Budget[]) => {
    const budgetsToSave = newBudgets.map((b) => ({
      id: b.id,
      category: b.category,
      limit: b.limit,
      period: b.period,
    }))
    localStorage.setItem(`budgets_${userId}`, JSON.stringify(budgetsToSave))
  }

  const handleCreateBudget = () => {
    if (!newBudget.category || !newBudget.limit) return

    const budget = budgetManager.createBudget(newBudget.category, Number.parseFloat(newBudget.limit), newBudget.period)

    const updatedBudgets = [...budgets, budget]
    setBudgets(updatedBudgets)
    saveBudgets(updatedBudgets)
    setNewBudget({ category: "", limit: "", period: "monthly" })
    setIsCreateDialogOpen(false)
  }

  const handleEditBudget = () => {
    if (!editingBudget) return

    const updatedBudgets = budgets.map((b) => (b.id === editingBudget.id ? editingBudget : b))
    setBudgets(updatedBudgets)
    saveBudgets(updatedBudgets)
    setEditingBudget(null)
  }

  const handleDeleteBudget = (budgetId: string) => {
    const updatedBudgets = budgets.filter((b) => b.id !== budgetId)
    setBudgets(updatedBudgets)
    saveBudgets(updatedBudgets)
    setBudgetToDelete(null)
  }

  const handleCreateFromSuggestion = (suggestion: any) => {
    const budget = budgetManager.createBudget(suggestion.category, suggestion.suggestedLimit, "monthly")
    const updatedBudgets = [...budgets, budget]
    setBudgets(updatedBudgets)
    saveBudgets(updatedBudgets)
  }

  const getBudgetStatusColor = (status: Budget["status"]) => {
    switch (status) {
      case "on_track":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "exceeded":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getBudgetStatusIcon = (status: Budget["status"]) => {
    switch (status) {
      case "on_track":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "exceeded":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const summary = budgetManager.getBudgetSummary()
  const suggestions = budgetManager.suggestBudgets()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Gestión de Presupuestos
              </CardTitle>
              <CardDescription>Controla tus gastos con presupuestos inteligentes</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nuevo Presupuesto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
                  <DialogDescription>
                    Establece límites de gasto para mantener tus finanzas bajo control
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      value={newBudget.category}
                      onChange={(e) => setNewBudget((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="ej. Alimentación, Transporte..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit">Límite de Gasto</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={newBudget.limit}
                      onChange={(e) => setNewBudget((prev) => ({ ...prev, limit: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Período</Label>
                    <Select
                      value={newBudget.period}
                      onValueChange={(value: any) => setNewBudget((prev) => ({ ...prev, period: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateBudget} className="w-full">
                    Crear Presupuesto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.total)}</div>
              <div className="text-sm text-blue-600">Presupuesto Total</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSpent)}</div>
              <div className="text-sm text-red-600">Total Gastado</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.remaining)}</div>
              <div className="text-sm text-green-600">Disponible</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{budgets.length}</div>
              <div className="text-sm text-purple-600">Presupuestos Activos</div>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {summary.onTrack} En camino
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {summary.warning} Advertencia
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {summary.exceeded} Excedidos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Alertas de Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === "exceeded"
                      ? "bg-red-50 border-red-500"
                      : alert.type === "warning"
                        ? "bg-yellow-50 border-yellow-500"
                        : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">{new Date(alert.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">{alert.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Presupuestos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100
              return (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{budget.category}</h4>
                        <p className="text-sm text-gray-500 capitalize">Presupuesto {budget.period}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getBudgetStatusColor(budget.status)}>
                        {getBudgetStatusIcon(budget.status)}
                        {budget.status === "on_track" && "En camino"}
                        {budget.status === "warning" && "Advertencia"}
                        {budget.status === "exceeded" && "Excedido"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gastado: {formatCurrency(budget.spent)}</span>
                      <span>Límite: {formatCurrency(budget.limit)}</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage.toFixed(1)}% usado</span>
                      <span>
                        {budget.limit - budget.spent > 0
                          ? `${formatCurrency(budget.limit - budget.spent)} restante`
                          : `${formatCurrency(budget.spent - budget.limit)} excedido`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setEditingBudget(budget)}>
                      <Settings className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setViewingBudget(budget)}>
                      <Eye className="w-3 h-3 mr-1" />
                      Ver detalles
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setBudgetToDelete(budget.id)}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Sugerencias de Presupuesto
            </CardTitle>
            <CardDescription>Basado en tu historial de gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{suggestion.category}</h4>
                    <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(suggestion.suggestedLimit)}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 bg-transparent"
                      onClick={() => handleCreateFromSuggestion(suggestion)}
                    >
                      Crear
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Budget Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Presupuesto</DialogTitle>
            <DialogDescription>Modifica los detalles de tu presupuesto</DialogDescription>
          </DialogHeader>
          {editingBudget && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <Input
                  id="edit-category"
                  value={editingBudget.category}
                  onChange={(e) => setEditingBudget({ ...editingBudget, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-limit">Límite de Gasto</Label>
                <Input
                  id="edit-limit"
                  type="number"
                  value={editingBudget.limit}
                  onChange={(e) => setEditingBudget({ ...editingBudget, limit: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-period">Período</Label>
                <Select
                  value={editingBudget.period}
                  onValueChange={(value: any) => setEditingBudget({ ...editingBudget, period: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditBudget} className="w-full">
                Guardar Cambios
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Budget Details Dialog */}
      <Dialog open={!!viewingBudget} onOpenChange={() => setViewingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Presupuesto</DialogTitle>
          </DialogHeader>
          {viewingBudget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Categoría</Label>
                  <p className="font-semibold">{viewingBudget.category}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Período</Label>
                  <p className="font-semibold capitalize">{viewingBudget.period}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Límite</Label>
                  <p className="font-semibold">{formatCurrency(viewingBudget.limit)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Gastado</Label>
                  <p className="font-semibold">{formatCurrency(viewingBudget.spent)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Restante</Label>
                  <p className="font-semibold">{formatCurrency(viewingBudget.limit - viewingBudget.spent)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Estado</Label>
                  <Badge className={getBudgetStatusColor(viewingBudget.status)}>
                    {getBudgetStatusIcon(viewingBudget.status)}
                    {viewingBudget.status === "on_track" && "En camino"}
                    {viewingBudget.status === "warning" && "Advertencia"}
                    {viewingBudget.status === "exceeded" && "Excedido"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Progreso</Label>
                <Progress
                  value={Math.min((viewingBudget.spent / viewingBudget.limit) * 100, 100)}
                  className="h-2 mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {((viewingBudget.spent / viewingBudget.limit) * 100).toFixed(1)}% usado
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El presupuesto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => budgetToDelete && handleDeleteBudget(budgetToDelete)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
