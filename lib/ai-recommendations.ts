// Sistema de IA para recomendaciones financieras
export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
  account?: string
}

export interface SpendingPattern {
  category: string
  averageAmount: number
  frequency: number
  trend: "increasing" | "decreasing" | "stable"
  percentage: number
}

export interface AIRecommendation {
  id: string
  type: "saving" | "budget" | "warning" | "opportunity" | "goal"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  category?: string
  suggestedAction: string
  potentialSaving?: number
  priority: number
}

export interface FinancialInsight {
  totalSpending: number
  averageMonthlySpending: number
  topCategories: SpendingPattern[]
  spendingTrend: "increasing" | "decreasing" | "stable"
  savingsRate: number
  recommendations: AIRecommendation[]
}

export class FinancialAI {
  private transactions: Transaction[]

  constructor(transactions: Transaction[]) {
    this.transactions = transactions
  }

  // Analizar patrones de gasto
  analyzeSpendingPatterns(): SpendingPattern[] {
    const categoryData = new Map<string, { total: number; count: number; amounts: number[] }>()

    this.transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const category = transaction.category
        const amount = Math.abs(transaction.amount)

        if (!categoryData.has(category)) {
          categoryData.set(category, { total: 0, count: 0, amounts: [] })
        }

        const data = categoryData.get(category)!
        data.total += amount
        data.count += 1
        data.amounts.push(amount)
      })

    const totalSpending = Array.from(categoryData.values()).reduce((sum, data) => sum + data.total, 0)

    return Array.from(categoryData.entries())
      .map(([category, data]) => {
        const averageAmount = data.total / data.count
        const trend = this.calculateTrend(category)

        return {
          category,
          averageAmount,
          frequency: data.count,
          trend,
          percentage: (data.total / totalSpending) * 100,
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
  }

  // Calcular tendencia de una categoría
  private calculateTrend(category: string): "increasing" | "decreasing" | "stable" {
    const categoryTransactions = this.transactions
      .filter((t) => t.category === category && t.type === "expense")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (categoryTransactions.length < 3) return "stable"

    const recent = categoryTransactions.slice(-3).reduce((sum, t) => sum + Math.abs(t.amount), 0) / 3
    const older =
      categoryTransactions.slice(0, -3).reduce((sum, t) => sum + Math.abs(t.amount), 0) /
      Math.max(1, categoryTransactions.length - 3)

    const changePercent = ((recent - older) / older) * 100

    if (changePercent > 15) return "increasing"
    if (changePercent < -15) return "decreasing"
    return "stable"
  }

  // Generar recomendaciones de IA
  generateRecommendations(): AIRecommendation[] {
    const patterns = this.analyzeSpendingPatterns()
    const recommendations: AIRecommendation[] = []
    let idCounter = 1

    // Recomendación de ahorro basada en categorías altas
    const topCategory = patterns[0]
    if (topCategory && topCategory.percentage > 30) {
      recommendations.push({
        id: `rec_${idCounter++}`,
        type: "saving",
        title: `Optimiza tus gastos en ${topCategory.category}`,
        description: `Gastas ${topCategory.percentage.toFixed(1)}% de tu presupuesto en ${topCategory.category}. Reducir un 20% podría ahorrarte $${(topCategory.averageAmount * 0.2).toFixed(0)} mensuales.`,
        impact: "high",
        category: topCategory.category,
        suggestedAction: `Revisa tus gastos en ${topCategory.category} y busca alternativas más económicas`,
        potentialSaving: topCategory.averageAmount * 0.2,
        priority: 1,
      })
    }

    // Alerta de tendencia creciente
    const increasingCategories = patterns.filter((p) => p.trend === "increasing")
    if (increasingCategories.length > 0) {
      const category = increasingCategories[0]
      recommendations.push({
        id: `rec_${idCounter++}`,
        type: "warning",
        title: `Gastos en aumento: ${category.category}`,
        description: `Tus gastos en ${category.category} han aumentado recientemente. Es momento de revisar este presupuesto.`,
        impact: "medium",
        category: category.category,
        suggestedAction: "Establece un límite mensual para esta categoría",
        priority: 2,
      })
    }

    // Recomendación de presupuesto
    const totalMonthlyExpenses = patterns.reduce((sum, p) => sum + p.averageAmount, 0)
    const totalIncome = this.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    if (totalMonthlyExpenses > totalIncome * 0.8) {
      recommendations.push({
        id: `rec_${idCounter++}`,
        type: "budget",
        title: "Ajusta tu presupuesto mensual",
        description: `Estás gastando ${((totalMonthlyExpenses / totalIncome) * 100).toFixed(1)}% de tus ingresos. Se recomienda no superar el 80%.`,
        impact: "high",
        suggestedAction: "Crea un presupuesto detallado y reduce gastos no esenciales",
        priority: 1,
      })
    }

    // Oportunidad de ahorro
    const savingsRate = ((totalIncome - totalMonthlyExpenses) / totalIncome) * 100
    if (savingsRate < 20) {
      recommendations.push({
        id: `rec_${idCounter++}`,
        type: "opportunity",
        title: "Aumenta tu tasa de ahorro",
        description: `Tu tasa de ahorro actual es ${savingsRate.toFixed(1)}%. Los expertos recomiendan ahorrar al menos 20% de los ingresos.`,
        impact: "medium",
        suggestedAction: "Automatiza transferencias a una cuenta de ahorros",
        potentialSaving: totalIncome * 0.2 - (totalIncome - totalMonthlyExpenses),
        priority: 3,
      })
    }

    // Meta de emergencia
    const emergencyFund = totalMonthlyExpenses * 6
    recommendations.push({
      id: `rec_${idCounter++}`,
      type: "goal",
      title: "Fondo de emergencia",
      description: `Considera crear un fondo de emergencia de $${emergencyFund.toFixed(0)} (6 meses de gastos).`,
      impact: "high",
      suggestedAction: "Ahorra gradualmente hasta alcanzar 6 meses de gastos",
      priority: 2,
    })

    return recommendations.sort((a, b) => a.priority - b.priority)
  }

  // Predecir gastos futuros
  predictFutureSpending(months = 3): { category: string; predictedAmount: number }[] {
    const patterns = this.analyzeSpendingPatterns()

    return patterns.map((pattern) => {
      let multiplier = 1

      // Ajustar predicción basada en tendencia
      if (pattern.trend === "increasing") {
        multiplier = 1.1 // 10% más
      } else if (pattern.trend === "decreasing") {
        multiplier = 0.9 // 10% menos
      }

      return {
        category: pattern.category,
        predictedAmount: pattern.averageAmount * months * multiplier,
      }
    })
  }

  // Detectar gastos inusuales
  detectUnusualSpending(): Transaction[] {
    const patterns = this.analyzeSpendingPatterns()
    const unusual: Transaction[] = []

    this.transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const pattern = patterns.find((p) => p.category === transaction.category)
        if (pattern) {
          const amount = Math.abs(transaction.amount)
          // Si el gasto es 2x mayor que el promedio, es inusual
          if (amount > pattern.averageAmount * 2) {
            unusual.push(transaction)
          }
        }
      })

    return unusual.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  }

  // Generar insights financieros completos
  generateInsights(): FinancialInsight {
    const patterns = this.analyzeSpendingPatterns()
    const totalSpending = patterns.reduce((sum, p) => sum + p.averageAmount, 0)
    const totalIncome = this.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const savingsRate = ((totalIncome - totalSpending) / totalIncome) * 100

    // Determinar tendencia general
    const increasingCount = patterns.filter((p) => p.trend === "increasing").length
    const decreasingCount = patterns.filter((p) => p.trend === "decreasing").length

    let spendingTrend: "increasing" | "decreasing" | "stable" = "stable"
    if (increasingCount > decreasingCount) spendingTrend = "increasing"
    else if (decreasingCount > increasingCount) spendingTrend = "decreasing"

    return {
      totalSpending,
      averageMonthlySpending: totalSpending,
      topCategories: patterns.slice(0, 5),
      spendingTrend,
      savingsRate,
      recommendations: this.generateRecommendations(),
    }
  }
}

// Utilidades para formateo
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}
