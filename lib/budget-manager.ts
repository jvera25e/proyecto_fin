// Sistema de gestión de presupuestos
// Unified types and AI helper come from the same module.
import type { Transaction } from "./ai-recommendations"
import { FinancialAI } from "./ai-recommendations"

export interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  startDate: string
  endDate: string
  status: "on_track" | "warning" | "exceeded"
  notifications: boolean
}

export interface BudgetAlert {
  id: string
  budgetId: string
  type: "warning" | "exceeded" | "approaching"
  message: string
  percentage: number
  date: string
}

export class BudgetManager {
  private budgets: Budget[]
  private transactions: Transaction[]

  constructor(budgets: Budget[], transactions: Transaction[]) {
    this.budgets = budgets
    this.transactions = transactions
  }

  // Crear nuevo presupuesto
  createBudget(category: string, limit: number, period: "monthly" | "weekly" | "yearly"): Budget {
    const now = new Date()
    const endDate = new Date()

    switch (period) {
      case "weekly":
        endDate.setDate(now.getDate() + 7)
        break
      case "monthly":
        endDate.setMonth(now.getMonth() + 1)
        break
      case "yearly":
        endDate.setFullYear(now.getFullYear() + 1)
        break
    }

    const budget: Budget = {
      id: `budget_${Date.now()}`,
      category,
      limit,
      spent: 0,
      period,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: "on_track",
      notifications: true,
    }

    this.budgets.push(budget)
    this.updateBudgetStatus(budget.id)
    return budget
  }

  // Actualizar estado del presupuesto
  updateBudgetStatus(budgetId: string): void {
    const budget = this.budgets.find((b) => b.id === budgetId)
    if (!budget) return

    // Calcular gastos en el período
    const spent = this.calculateSpentInPeriod(budget)
    budget.spent = spent

    const percentage = (spent / budget.limit) * 100

    if (percentage >= 100) {
      budget.status = "exceeded"
    } else if (percentage >= 80) {
      budget.status = "warning"
    } else {
      budget.status = "on_track"
    }
  }

  // Calcular gastos en período específico
  private calculateSpentInPeriod(budget: Budget): number {
    const startDate = new Date(budget.startDate)
    const endDate = new Date(budget.endDate)

    return this.transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === budget.category &&
          new Date(t.date) >= startDate &&
          new Date(t.date) <= endDate,
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }

  // Generar alertas de presupuesto
  generateAlerts(): BudgetAlert[] {
    const alerts: BudgetAlert[] = []

    this.budgets.forEach((budget) => {
      this.updateBudgetStatus(budget.id)
      const percentage = (budget.spent / budget.limit) * 100

      if (percentage >= 100) {
        alerts.push({
          id: `alert_${Date.now()}_${budget.id}`,
          budgetId: budget.id,
          type: "exceeded",
          message: `Has excedido tu presupuesto de ${budget.category} en ${(percentage - 100).toFixed(1)}%`,
          percentage,
          date: new Date().toISOString(),
        })
      } else if (percentage >= 80) {
        alerts.push({
          id: `alert_${Date.now()}_${budget.id}`,
          budgetId: budget.id,
          type: "warning",
          message: `Has usado ${percentage.toFixed(1)}% de tu presupuesto de ${budget.category}`,
          percentage,
          date: new Date().toISOString(),
        })
      } else if (percentage >= 70) {
        alerts.push({
          id: `alert_${Date.now()}_${budget.id}`,
          budgetId: budget.id,
          type: "approaching",
          message: `Te acercas al límite de tu presupuesto de ${budget.category}`,
          percentage,
          date: new Date().toISOString(),
        })
      }
    })

    return alerts
  }

  // Obtener resumen de presupuestos
  getBudgetSummary() {
    const total = this.budgets.reduce((sum, b) => sum + b.limit, 0)
    const totalSpent = this.budgets.reduce((sum, b) => sum + b.spent, 0)
    const onTrack = this.budgets.filter((b) => b.status === "on_track").length
    const warning = this.budgets.filter((b) => b.status === "warning").length
    const exceeded = this.budgets.filter((b) => b.status === "exceeded").length

    return {
      total,
      totalSpent,
      remaining: total - totalSpent,
      onTrack,
      warning,
      exceeded,
      budgets: this.budgets,
    }
  }

  // Sugerir presupuestos basados en historial
  suggestBudgets(): { category: string; suggestedLimit: number; reasoning: string }[] {
    const ai = new FinancialAI(this.transactions)
    const patterns = ai.analyzeSpendingPatterns()

    return patterns.slice(0, 5).map((pattern) => ({
      category: pattern.category,
      suggestedLimit: Math.ceil(pattern.averageAmount * 1.1), // 10% buffer
      reasoning: `Basado en tu promedio de $${pattern.averageAmount.toFixed(0)} mensuales en ${pattern.category}`,
    }))
  }
}
