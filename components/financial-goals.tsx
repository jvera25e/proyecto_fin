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
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Target,
  PlusCircle,
  CalendarIcon,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Plane,
  Shield,
  ShoppingBag,
  Coins,
} from "lucide-react"
import { GoalsManager, type FinancialGoal, type GoalProgress } from "@/lib/goals-manager"
import { formatCurrency } from "@/lib/ai-recommendations"

const formatDate = (date: Date, format: "PPP" | "MMM yyyy" = "PPP"): string => {
  if (format === "MMM yyyy") {
    return date.toLocaleDateString("es-ES", { month: "short", year: "numeric" })
  }
  return date.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

interface FinancialGoalsProps {
  monthlyIncome: number
  monthlyExpenses: number
}

const goalCategories = [
  { value: "emergency", label: "Fondo de Emergencia", icon: Shield },
  { value: "vacation", label: "Vacaciones", icon: Plane },
  { value: "purchase", label: "Compra", icon: ShoppingBag },
  { value: "investment", label: "Inversión", icon: TrendingUp },
  { value: "debt", label: "Pagar Deuda", icon: AlertCircle },
  { value: "other", label: "Otro", icon: Target },
]

const priorities = [
  { value: "high", label: "Alta", color: "bg-red-100 text-red-800" },
  { value: "medium", label: "Media", color: "bg-yellow-100 text-yellow-800" },
  { value: "low", label: "Baja", color: "bg-green-100 text-green-800" },
]

export function FinancialGoals({ monthlyIncome, monthlyExpenses }: FinancialGoalsProps) {
  const [goalsManager] = useState(() => new GoalsManager())
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [goalProgress, setGoalProgress] = useState<{ [key: string]: GoalProgress }>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año por defecto
    category: "other" as FinancialGoal["category"],
    priority: "medium" as FinancialGoal["priority"],
    monthlyContribution: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Cargar metas existentes (en producción vendría de la base de datos)
    const existingGoals: FinancialGoal[] = [
      {
        id: "goal_1",
        title: "Fondo de Emergencia",
        description: "6 meses de gastos para emergencias",
        targetAmount: 12000,
        currentAmount: 4500,
        deadline: new Date(2024, 11, 31).toISOString(),
        category: "emergency",
        priority: "high",
        status: "active",
        monthlyContribution: 500,
        autoSave: true,
        createdAt: new Date(2024, 0, 1).toISOString(),
      },
      {
        id: "goal_2",
        title: "Vacaciones en Europa",
        description: "Viaje de 2 semanas por Europa",
        targetAmount: 5000,
        currentAmount: 1200,
        deadline: new Date(2024, 6, 15).toISOString(),
        category: "vacation",
        priority: "medium",
        status: "active",
        monthlyContribution: 300,
        autoSave: false,
        createdAt: new Date(2024, 0, 15).toISOString(),
      },
      {
        id: "goal_3",
        title: "Nueva Laptop",
        description: "MacBook Pro para trabajo",
        targetAmount: 2500,
        currentAmount: 2500,
        deadline: new Date(2024, 2, 1).toISOString(),
        category: "purchase",
        priority: "low",
        status: "completed",
        monthlyContribution: 0,
        autoSave: false,
        createdAt: new Date(2023, 11, 1).toISOString(),
        completedAt: new Date(2024, 1, 28).toISOString(),
      },
    ]

    setGoals(existingGoals)

    // Calcular progreso para cada meta
    const progressData: { [key: string]: GoalProgress } = {}
    existingGoals.forEach((goal) => {
      const progress = goalsManager.calculateProgress(goal.id)
      if (progress) {
        progressData[goal.id] = progress
      }
    })
    setGoalProgress(progressData)
  }, [goalsManager])

  const handleCreateGoal = () => {
    // Validación
    const newErrors: { [key: string]: string } = {}

    if (!newGoal.title.trim()) {
      newErrors.title = "El título es requerido"
    }

    if (!newGoal.targetAmount || Number.parseFloat(newGoal.targetAmount) <= 0) {
      newErrors.targetAmount = "El monto debe ser mayor a 0"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const goal = goalsManager.createGoal(
      newGoal.title,
      Number.parseFloat(newGoal.targetAmount),
      newGoal.deadline.toISOString(),
      newGoal.category,
      newGoal.priority,
      Number.parseFloat(newGoal.monthlyContribution) || 0,
    )

    goal.description = newGoal.description

    setGoals((prev) => [...prev, goal])

    // Reset form
    setNewGoal({
      title: "",
      description: "",
      targetAmount: "",
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      category: "other",
      priority: "medium",
      monthlyContribution: "",
    })
    setErrors({})
    setIsCreateDialogOpen(false)
  }

  const handleAddContribution = (goalId: string, amount: number) => {
    goalsManager.updateGoalProgress(goalId, amount)

    // Actualizar estado local
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? { ...goal, currentAmount: goal.currentAmount + amount } : goal)),
    )

    // Recalcular progreso
    const progress = goalsManager.calculateProgress(goalId)
    if (progress) {
      setGoalProgress((prev) => ({ ...prev, [goalId]: progress }))
    }
  }

  const getCategoryIcon = (category: FinancialGoal["category"]) => {
    const categoryData = goalCategories.find((c) => c.value === category)
    const Icon = categoryData?.icon || Target
    return <Icon className="w-4 h-4" />
  }

  const getPriorityColor = (priority: FinancialGoal["priority"]) => {
    const priorityData = priorities.find((p) => p.value === priority)
    return priorityData?.color || "bg-gray-100 text-gray-800"
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const summary = goalsManager.getGoalsSummary()
  const recommendations = goalsManager.generateGoalRecommendations(monthlyIncome, monthlyExpenses)

  return (
    <div className="space-y-6">
      {/* Resumen de Metas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Metas Financieras
              </CardTitle>
              <CardDescription>Alcanza tus objetivos financieros paso a paso</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nueva Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Meta Financiera</DialogTitle>
                  <DialogDescription>Define un objetivo claro y alcanzable para tu futuro financiero</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Título de la Meta *</Label>
                      <Input
                        id="title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="ej. Fondo de emergencia, Vacaciones..."
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe tu meta en detalle..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetAmount">Monto Objetivo *</Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        step="0.01"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal((prev) => ({ ...prev, targetAmount: e.target.value }))}
                        placeholder="0.00"
                      />
                      {errors.targetAmount && <p className="text-red-500 text-sm mt-1">{errors.targetAmount}</p>}
                    </div>

                    <div>
                      <Label>Fecha Límite</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(newGoal.deadline)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newGoal.deadline}
                            onSelect={(date) => date && setNewGoal((prev) => ({ ...prev, deadline: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={newGoal.category}
                        onValueChange={(value: any) => setNewGoal((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {goalCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <category.icon className="w-4 h-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select
                        value={newGoal.priority}
                        onValueChange={(value: any) => setNewGoal((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="monthlyContribution">Contribución Mensual</Label>
                      <Input
                        id="monthlyContribution"
                        type="number"
                        step="0.01"
                        value={newGoal.monthlyContribution}
                        onChange={(e) => setNewGoal((prev) => ({ ...prev, monthlyContribution: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreateGoal} className="w-full">
                    Crear Meta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.totalGoals}</div>
              <div className="text-sm text-purple-600">Total Metas</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.activeGoals}</div>
              <div className="text-sm text-blue-600">Activas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.completedGoals}</div>
              <div className="text-sm text-green-600">Completadas</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{summary.completionRate.toFixed(1)}%</div>
              <div className="text-sm text-orange-600">Tasa de Éxito</div>
            </div>
          </div>

          {/* Progreso Total */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso Total: {formatCurrency(summary.totalSaved)}</span>
              <span>Objetivo: {formatCurrency(summary.totalTarget)}</span>
            </div>
            <Progress value={(summary.totalSaved / summary.totalTarget) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      {recommendations.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metas Activas */}
      <Card>
        <CardHeader>
          <CardTitle>Metas Activas ({activeGoals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = goalProgress[goal.id]
              const percentage = (goal.currentAmount / goal.targetAmount) * 100

              return (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-gray-500">{goal.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(goal.priority)}>
                        {priorities.find((p) => p.value === goal.priority)?.label}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(new Date(goal.deadline), "MMM yyyy")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {formatCurrency(goal.currentAmount)}</span>
                      <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage.toFixed(1)}% completado</span>
                      <span>
                        {goal.targetAmount - goal.currentAmount > 0
                          ? `${formatCurrency(goal.targetAmount - goal.currentAmount)} restante`
                          : "¡Meta alcanzada!"}
                      </span>
                    </div>
                  </div>

                  {progress && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Meses restantes:</span>
                          <span className="font-medium ml-2">{progress.monthsRemaining}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sugerido mensual:</span>
                          <span className="font-medium ml-2">{formatCurrency(progress.suggestedMonthlyAmount)}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge className={progress.onTrack ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {progress.onTrack ? "En camino" : "Necesita atención"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddContribution(goal.id, 100)}>
                      <DollarSign className="w-3 h-3 mr-1" />
                      +$100
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddContribution(goal.id, goal.monthlyContribution)}
                    >
                      <Coins className="w-3 h-3 mr-1" />
                      Contribución mensual
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metas Completadas */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Metas Completadas ({completedGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">{goal.title}</h4>
                      <p className="text-sm text-green-600">
                        Completada el {formatDate(new Date(goal.completedAt!), "PPP")}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-700 font-semibold">{formatCurrency(goal.targetAmount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
