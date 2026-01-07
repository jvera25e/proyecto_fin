// Sistema de reportes y analytics avanzados
import type { Transaction } from "./ai-recommendations"

export interface CategoryAnalysis {
  category: string
  totalAmount: number
  transactionCount: number
  averageAmount: number
  percentage: number
  trend: "up" | "down" | "stable"
  monthlyData: { month: string; amount: number }[]
}

export interface MonthlyReport {
  month: string
  year: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRate: number
  topCategories: CategoryAnalysis[]
  transactionCount: number
}

export interface CashFlowPrediction {
  month: string
  predictedIncome: number
  predictedExpenses: number
  predictedBalance: number
  confidence: number
}

export interface FinancialReport {
  period: string
  summary: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    savingsRate: number
    averageMonthlyIncome: number
    averageMonthlyExpenses: number
  }
  categoryBreakdown: CategoryAnalysis[]
  monthlyReports: MonthlyReport[]
  trends: {
    incomeGrowth: number
    expenseGrowth: number
    savingsGrowth: number
  }
  cashFlowPredictions: CashFlowPrediction[]
}

export class ReportsAnalytics {
  private transactions: Transaction[]

  constructor(transactions: Transaction[]) {
    this.transactions = transactions
  }

  // Generar reporte completo
  generateReport(startDate: Date, endDate: Date): FinancialReport {
    const filteredTransactions = this.transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate,
    )

    const summary = this.calculateSummary(filteredTransactions)
    const categoryBreakdown = this.analyzeCategoriesDetailed(filteredTransactions)
    const monthlyReports = this.generateMonthlyReports(filteredTransactions)
    const trends = this.calculateTrends(monthlyReports)
    const cashFlowPredictions = this.predictCashFlow(monthlyReports)

    return {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      summary,
      categoryBreakdown,
      monthlyReports,
      trends,
      cashFlowPredictions,
    }
  }

  // Calcular resumen general
  private calculateSummary(transactions: Transaction[]) {
    const income = transactions.filter((t) => t.type === "income")
    const expenses = transactions.filter((t) => t.type === "expense")

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const netIncome = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

    // Calcular promedios mensuales
    const months = this.getUniqueMonths(transactions)
    const monthCount = Math.max(months.length, 1)

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      averageMonthlyIncome: totalIncome / monthCount,
      averageMonthlyExpenses: totalExpenses / monthCount,
    }
  }

  // Análisis detallado por categorías
  private analyzeCategoriesDetailed(transactions: Transaction[]): CategoryAnalysis[] {
    const categoryMap = new Map<string, Transaction[]>()

    // Agrupar por categoría
    transactions.forEach((t) => {
      if (!categoryMap.has(t.category)) {
        categoryMap.set(t.category, [])
      }
      categoryMap.get(t.category)!.push(t)
    })

    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return Array.from(categoryMap.entries())
      .map(([category, categoryTransactions]) => {
        const categoryTotal = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const monthlyData = this.getCategoryMonthlyData(categoryTransactions)
        const trend = this.calculateCategoryTrend(monthlyData)

        return {
          category,
          totalAmount: categoryTotal,
          transactionCount: categoryTransactions.length,
          averageAmount: categoryTotal / categoryTransactions.length,
          percentage: (categoryTotal / totalAmount) * 100,
          trend,
          monthlyData,
        }
      })
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }

  // Datos mensuales por categoría
  private getCategoryMonthlyData(transactions: Transaction[]): { month: string; amount: number }[] {
    const monthlyMap = new Map<string, number>()

    transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, 0)
      }
      monthlyMap.set(monthKey, monthlyMap.get(monthKey)! + Math.abs(t.amount))
    })

    return Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Calcular tendencia de categoría
  private calculateCategoryTrend(monthlyData: { month: string; amount: number }[]): "up" | "down" | "stable" {
    if (monthlyData.length < 2) return "stable"

    const recent = monthlyData.slice(-3).reduce((sum, d) => sum + d.amount, 0) / Math.min(3, monthlyData.length)
    const older = monthlyData.slice(0, -3).reduce((sum, d) => sum + d.amount, 0) / Math.max(1, monthlyData.length - 3)

    const changePercent = older > 0 ? ((recent - older) / older) * 100 : 0

    if (changePercent > 10) return "up"
    if (changePercent < -10) return "down"
    return "stable"
  }

  // Generar reportes mensuales
  private generateMonthlyReports(transactions: Transaction[]): MonthlyReport[] {
    const monthlyMap = new Map<string, Transaction[]>()

    // Agrupar por mes
    transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, [])
      }
      monthlyMap.get(monthKey)!.push(t)
    })

    return Array.from(monthlyMap.entries())
      .map(([monthKey, monthTransactions]) => {
        const [year, month] = monthKey.split("-")
        const income = monthTransactions.filter((t) => t.type === "income")
        const expenses = monthTransactions.filter((t) => t.type === "expense")

        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
        const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const netIncome = totalIncome - totalExpenses
        const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

        const topCategories = this.analyzeCategoriesDetailed(expenses).slice(0, 5)

        return {
          month: monthKey,
          year: Number.parseInt(year),
          totalIncome,
          totalExpenses,
          netIncome,
          savingsRate,
          topCategories,
          transactionCount: monthTransactions.length,
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Calcular tendencias
  private calculateTrends(monthlyReports: MonthlyReport[]) {
    if (monthlyReports.length < 2) {
      return { incomeGrowth: 0, expenseGrowth: 0, savingsGrowth: 0 }
    }

    const recent = monthlyReports.slice(-3)
    const older = monthlyReports.slice(0, -3)

    const recentAvgIncome = recent.reduce((sum, r) => sum + r.totalIncome, 0) / recent.length
    const olderAvgIncome =
      older.length > 0 ? older.reduce((sum, r) => sum + r.totalIncome, 0) / older.length : recentAvgIncome

    const recentAvgExpenses = recent.reduce((sum, r) => sum + r.totalExpenses, 0) / recent.length
    const olderAvgExpenses =
      older.length > 0 ? older.reduce((sum, r) => sum + r.totalExpenses, 0) / older.length : recentAvgExpenses

    const recentAvgSavings = recent.reduce((sum, r) => sum + r.netIncome, 0) / recent.length
    const olderAvgSavings =
      older.length > 0 ? older.reduce((sum, r) => sum + r.netIncome, 0) / older.length : recentAvgSavings

    return {
      incomeGrowth: olderAvgIncome > 0 ? ((recentAvgIncome - olderAvgIncome) / olderAvgIncome) * 100 : 0,
      expenseGrowth: olderAvgExpenses > 0 ? ((recentAvgExpenses - olderAvgExpenses) / olderAvgExpenses) * 100 : 0,
      savingsGrowth:
        olderAvgSavings !== 0 ? ((recentAvgSavings - olderAvgSavings) / Math.abs(olderAvgSavings)) * 100 : 0,
    }
  }

  // Predicción de flujo de efectivo
  private predictCashFlow(monthlyReports: MonthlyReport[]): CashFlowPrediction[] {
    if (monthlyReports.length < 3) return []

    const predictions: CashFlowPrediction[] = []
    const lastThreeMonths = monthlyReports.slice(-3)

    // Calcular promedios y tendencias
    const avgIncome = lastThreeMonths.reduce((sum, r) => sum + r.totalIncome, 0) / 3
    const avgExpenses = lastThreeMonths.reduce((sum, r) => sum + r.totalExpenses, 0) / 3

    // Calcular tendencia de crecimiento
    const incomeGrowthRate = this.calculateGrowthRate(lastThreeMonths.map((r) => r.totalIncome))
    const expenseGrowthRate = this.calculateGrowthRate(lastThreeMonths.map((r) => r.totalExpenses))

    // Generar predicciones para los próximos 6 meses
    for (let i = 1; i <= 6; i++) {
      const predictedIncome = avgIncome * Math.pow(1 + incomeGrowthRate / 100, i)
      const predictedExpenses = avgExpenses * Math.pow(1 + expenseGrowthRate / 100, i)
      const predictedBalance = predictedIncome - predictedExpenses

      const currentDate = new Date()
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, "0")}`

      // Calcular confianza basada en la consistencia de los datos históricos
      const confidence = Math.max(0.3, 1 - i * 0.1) // Decrece con el tiempo

      predictions.push({
        month: monthKey,
        predictedIncome,
        predictedExpenses,
        predictedBalance,
        confidence,
      })
    }

    return predictions
  }

  // Calcular tasa de crecimiento
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0

    let totalGrowth = 0
    let validPairs = 0

    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        totalGrowth += ((values[i] - values[i - 1]) / values[i - 1]) * 100
        validPairs++
      }
    }

    return validPairs > 0 ? totalGrowth / validPairs : 0
  }

  // Obtener meses únicos
  private getUniqueMonths(transactions: Transaction[]): string[] {
    const months = new Set<string>()
    transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      months.add(monthKey)
    })
    return Array.from(months).sort()
  }

  // Generar datos para gráficos
  generateChartData(type: "income" | "expenses" | "categories" | "trends") {
    switch (type) {
      case "income":
        return this.getIncomeChartData()
      case "expenses":
        return this.getExpensesChartData()
      case "categories":
        return this.getCategoriesChartData()
      case "trends":
        return this.getTrendsChartData()
      default:
        return []
    }
  }

  private getIncomeChartData() {
    const monthlyData = new Map<string, number>()

    this.transactions
      .filter((t) => t.type === "income")
      .forEach((t) => {
        const date = new Date(t.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + t.amount)
      })

    return Array.from(monthlyData.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private getExpensesChartData() {
    const monthlyData = new Map<string, number>()

    this.transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const date = new Date(t.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + Math.abs(t.amount))
      })

    return Array.from(monthlyData.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private getCategoriesChartData() {
    const categoryData = new Map<string, number>()

    this.transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryData.set(t.category, (categoryData.get(t.category) || 0) + Math.abs(t.amount))
      })

    return Array.from(categoryData.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10) // Top 10 categorías
  }

  private getTrendsChartData() {
    const monthlyReports = this.generateMonthlyReports(this.transactions)

    return monthlyReports.map((report) => ({
      month: report.month,
      income: report.totalIncome,
      expenses: report.totalExpenses,
      savings: report.netIncome,
      savingsRate: report.savingsRate,
    }))
  }
}

// Utilidades para formateo de reportes
export const formatReportCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatReportPercentage = (value: number): string => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

export const formatReportDate = (dateString: string): string => {
  const [year, month] = dateString.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  return date.toLocaleDateString("es-ES", { year: "numeric", month: "long" })
}
