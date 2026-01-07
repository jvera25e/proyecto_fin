// Sistema de gestión de metas financieras
export interface FinancialGoal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: "emergency" | "vacation" | "purchase" | "investment" | "debt" | "other"
  priority: "high" | "medium" | "low"
  status: "active" | "completed" | "paused"
  monthlyContribution: number
  autoSave: boolean
  createdAt: string
  completedAt?: string
}

export interface GoalProgress {
  goalId: string
  percentage: number
  remainingAmount: number
  monthsRemaining: number
  onTrack: boolean
  suggestedMonthlyAmount: number
}

export class GoalsManager {
  private goals: FinancialGoal[]

  constructor(goals: FinancialGoal[] = []) {
    this.goals = goals
  }

  // Crear nueva meta
  createGoal(
    title: string,
    targetAmount: number,
    deadline: string,
    category: FinancialGoal["category"],
    priority: FinancialGoal["priority"] = "medium",
    monthlyContribution = 0,
  ): FinancialGoal {
    const goal: FinancialGoal = {
      id: `goal_${Date.now()}`,
      title,
      description: "",
      targetAmount,
      currentAmount: 0,
      deadline,
      category,
      priority,
      status: "active",
      monthlyContribution,
      autoSave: false,
      createdAt: new Date().toISOString(),
    }

    this.goals.push(goal)
    return goal
  }

  // Actualizar progreso de meta
  updateGoalProgress(goalId: string, amount: number): void {
    const goal = this.goals.find((g) => g.id === goalId)
    if (!goal) return

    goal.currentAmount += amount

    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "completed"
      goal.completedAt = new Date().toISOString()
    }
  }

  // Calcular progreso de meta
  calculateProgress(goalId: string): GoalProgress | null {
    const goal = this.goals.find((g) => g.id === goalId)
    if (!goal) return null

    const percentage = (goal.currentAmount / goal.targetAmount) * 100
    const remainingAmount = goal.targetAmount - goal.currentAmount

    const now = new Date()
    const deadline = new Date(goal.deadline)
    const monthsRemaining = Math.max(
      0,
      (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth()),
    )

    const suggestedMonthlyAmount = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount

    // Determinar si está en camino
    const expectedProgress =
      monthsRemaining > 0
        ? ((new Date().getTime() - new Date(goal.createdAt).getTime()) /
            (deadline.getTime() - new Date(goal.createdAt).getTime())) *
          100
        : 100

    const onTrack = percentage >= expectedProgress * 0.8 // 80% del progreso esperado

    return {
      goalId,
      percentage: Math.min(percentage, 100),
      remainingAmount,
      monthsRemaining,
      onTrack,
      suggestedMonthlyAmount,
    }
  }

  // Obtener metas por prioridad
  getGoalsByPriority(): { high: FinancialGoal[]; medium: FinancialGoal[]; low: FinancialGoal[] } {
    return {
      high: this.goals.filter((g) => g.priority === "high" && g.status === "active"),
      medium: this.goals.filter((g) => g.priority === "medium" && g.status === "active"),
      low: this.goals.filter((g) => g.priority === "low" && g.status === "active"),
    }
  }

  // Generar recomendaciones para metas
  generateGoalRecommendations(
    monthlyIncome: number,
    monthlyExpenses: number,
  ): {
    emergencyFund?: FinancialGoal
    suggestions: string[]
  } {
    const availableForSaving = monthlyIncome - monthlyExpenses
    const suggestions: string[] = []

    // Recomendar fondo de emergencia si no existe
    const hasEmergencyFund = this.goals.some((g) => g.category === "emergency" && g.status === "active")
    let emergencyFund: FinancialGoal | undefined

    if (!hasEmergencyFund && availableForSaving > 0) {
      const emergencyAmount = monthlyExpenses * 6
      emergencyFund = this.createGoal(
        "Fondo de Emergencia",
        emergencyAmount,
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
        "emergency",
        "high",
        Math.min(availableForSaving * 0.3, emergencyAmount / 12),
      )
      suggestions.push("Crear un fondo de emergencia es tu prioridad #1")
    }

    // Otras sugerencias
    if (availableForSaving > monthlyIncome * 0.2) {
      suggestions.push("Considera invertir en un fondo indexado para el largo plazo")
    }

    if (this.goals.filter((g) => g.status === "active").length === 0) {
      suggestions.push("Establece al menos una meta financiera para mantenerte motivado")
    }

    const completedGoals = this.goals.filter((g) => g.status === "completed").length
    if (completedGoals > 0) {
      suggestions.push(`¡Felicidades! Has completado ${completedGoals} meta${completedGoals > 1 ? "s" : ""}`)
    }

    return { emergencyFund, suggestions }
  }

  // Obtener resumen de metas
  getGoalsSummary() {
    const active = this.goals.filter((g) => g.status === "active")
    const completed = this.goals.filter((g) => g.status === "completed")

    const totalTarget = active.reduce((sum, g) => sum + g.targetAmount, 0)
    const totalSaved = active.reduce((sum, g) => sum + g.currentAmount, 0)
    const totalMonthlyContribution = active.reduce((sum, g) => sum + g.monthlyContribution, 0)

    return {
      totalGoals: this.goals.length,
      activeGoals: active.length,
      completedGoals: completed.length,
      totalTarget,
      totalSaved,
      totalRemaining: totalTarget - totalSaved,
      totalMonthlyContribution,
      completionRate: this.goals.length > 0 ? (completed.length / this.goals.length) * 100 : 0,
    }
  }
}
