"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import {
  BarChart3,
  CalendarIcon,
  Download,
  FileDown,
  PieChartIcon,
  LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

interface ReportsDashboardProps {
  transactions?: Transaction[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

// Datos de ejemplo para cuando no hay transacciones
const SAMPLE_DATA = {
  trendsData: [
    { month: "2024-01", income: 5000, expenses: 3500, savings: 1500, savingsRate: 30 },
    { month: "2024-02", income: 5200, expenses: 3800, savings: 1400, savingsRate: 27 },
    { month: "2024-03", income: 4800, expenses: 3200, savings: 1600, savingsRate: 33 },
  ],
  categoriesData: [
    { category: "Alimentación", amount: 800 },
    { category: "Transporte", amount: 600 },
    { category: "Entretenimiento", amount: 400 },
    { category: "Servicios", amount: 300 },
  ],
}

export function ReportsDashboard({ transactions = [] }: ReportsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar")
  const [loading, setLoading] = useState(false)

  // Procesar datos para reportes con memoización
  const reportData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        summary: {
          totalIncome: 15000,
          totalExpenses: 10500,
          netIncome: 4500,
          savingsRate: 30,
          transactionCount: 0,
        },
        trendsData: SAMPLE_DATA.trendsData,
        categoriesData: SAMPLE_DATA.categoriesData,
      }
    }

    const now = new Date()
    let startDate: Date

    switch (selectedPeriod) {
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case "1year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    }

    const filteredTransactions = transactions.filter((t) => {
      try {
        return new Date(t.date) >= startDate
      } catch {
        return false
      }
    })

    // Calcular totales con validación
    const incomeTransactions = filteredTransactions.filter((t) => t.type === "income")
    const expenseTransactions = filteredTransactions.filter((t) => t.type === "expense")

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    const netIncome = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

    // Datos mensuales con validación
    const monthlyData = new Map<string, { income: number; expenses: number; savings: number }>()

    filteredTransactions.forEach((t) => {
      try {
        const date = new Date(t.date)
        if (isNaN(date.getTime())) return

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { income: 0, expenses: 0, savings: 0 })
        }

        const monthData = monthlyData.get(monthKey)!
        const amount = t.amount || 0

        if (t.type === "income") {
          monthData.income += amount
        } else {
          monthData.expenses += Math.abs(amount)
        }
        monthData.savings = monthData.income - monthData.expenses
      } catch (error) {
        console.warn("Error processing transaction:", t, error)
      }
    })

    const trendsData = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.savings,
        savingsRate: data.income > 0 ? (data.savings / data.income) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Datos por categorías con validación
    const categoryData = new Map<string, number>()
    expenseTransactions.forEach((t) => {
      if (t.category && t.amount) {
        categoryData.set(t.category, (categoryData.get(t.category) || 0) + Math.abs(t.amount))
      }
    })

    const categoriesData = Array.from(categoryData.entries())
      .map(([category, amount]) => ({ category, amount }))
      .filter(({ amount }) => amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)

    return {
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        savingsRate,
        transactionCount: filteredTransactions.length,
      },
      trendsData: trendsData.length > 0 ? trendsData : SAMPLE_DATA.trendsData,
      categoriesData: categoriesData.length > 0 ? categoriesData : SAMPLE_DATA.categoriesData,
    }
  }, [transactions, selectedPeriod])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const exportReport = () => {
    try {
      const reportExportData = {
        period: selectedPeriod,
        summary: reportData.summary,
        trendsData: reportData.trendsData,
        categoriesData: reportData.categoriesData,
        generatedAt: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(reportExportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `reporte-financiero-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting report:", error)
    }
  }

  // Función para renderizar el gráfico de tendencias
  const renderTrendsChart = () => {
    if (!reportData.trendsData || reportData.trendsData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No hay datos suficientes para mostrar el gráfico
        </div>
      )
    }

    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
            <Bar dataKey="income" fill="#10B981" name="Ingresos" />
            <Bar dataKey="expenses" fill="#EF4444" name="Gastos" />
            <Bar dataKey="savings" fill="#3B82F6" name="Ahorros" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
            <Line type="monotone" dataKey="income" stroke="#10B981" name="Ingresos" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Gastos" strokeWidth={2} />
            <Line type="monotone" dataKey="savings" stroke="#3B82F6" name="Ahorros" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={reportData.trendsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
          <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
          <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Función para renderizar el gráfico de categorías
  const renderCategoriesChart = () => {
    if (!reportData.categoriesData || reportData.categoriesData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No hay datos de categorías para mostrar
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={reportData.categoriesData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, value }) => `${category}: ${formatCurrency(Number(value) || 0)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {reportData.categoriesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const exportToPDF = async () => {
    try {
      // En una app real, esto usaría una librería como jsPDF o html2pdf
      const reportContent = `
REPORTE FINANCIERO
Generado: ${new Date().toLocaleDateString("es-ES")}
Período: ${selectedPeriod === "1month" ? "Último mes" : selectedPeriod === "3months" ? "Últimos 3 meses" : selectedPeriod === "6months" ? "Últimos 6 meses" : "Último año"}

RESUMEN EJECUTIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ingresos Totales: ${formatCurrency(reportData.summary.totalIncome)}
Gastos Totales: ${formatCurrency(reportData.summary.totalExpenses)}
Ingreso Neto: ${formatCurrency(reportData.summary.netIncome)}
Tasa de Ahorro: ${reportData.summary.savingsRate.toFixed(1)}%
Transacciones: ${reportData.summary.transactionCount}

DISTRIBUCIÓN POR CATEGORÍAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reportData.categoriesData.map((cat) => `${cat.category}: ${formatCurrency(cat.amount)}`).join("\n")}

TENDENCIAS MENSUALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reportData.trendsData.map((trend) => `${trend.month}: Ingresos ${formatCurrency(trend.income)}, Gastos ${formatCurrency(trend.expenses)}`).join("\n")}
      `

      const blob = new Blob([reportContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `reporte-financiero-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert("Reporte descargado. En una aplicación completa, esto generaría un PDF con gráficos.")
    } catch (error) {
      console.error("Error al exportar PDF:", error)
      alert("Error al generar el reporte")
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 animate-pulse" />
            Generando reporte...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Controles del Reporte */}
      <Card className="glass card-hover border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Reportes y Analytics
              </CardTitle>
              <CardDescription>Análisis detallado de tu actividad financiera</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mes</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último año</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportToPDF} className="btn-press">
                <FileDown className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" onClick={exportReport} className="btn-press bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Período:{" "}
                {selectedPeriod === "1month"
                  ? "Último mes"
                  : selectedPeriod === "3months"
                    ? "Últimos 3 meses"
                    : selectedPeriod === "6months"
                      ? "Últimos 6 meses"
                      : "Último año"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === "area" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("area")}
              >
                <PieChartIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
          <CardDescription>Métricas clave del período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.summary.totalIncome)}</div>
              <div className="text-sm text-green-600">Ingresos Totales</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(reportData.summary.totalExpenses)}</div>
              <div className="text-sm text-red-600">Gastos Totales</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.summary.netIncome)}</div>
              <div className="text-sm text-blue-600">Ingreso Neto</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {reportData.summary.netIncome >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                )}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{reportData.summary.savingsRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Tasa de Ahorro</div>
              <div className="text-xs text-gray-500 mt-1">
                {reportData.summary.savingsRate >= 20
                  ? "¡Excelente!"
                  : reportData.summary.savingsRate >= 10
                    ? "Bueno"
                    : "Mejorable"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias Mensuales */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencias Mensuales</CardTitle>
            <CardDescription>Evolución de ingresos, gastos y ahorros</CardDescription>
          </CardHeader>
          <CardContent>{renderTrendsChart()}</CardContent>
        </Card>

        {/* Distribución por Categorías */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categorías</CardTitle>
            <CardDescription>Gastos por categoría en el período</CardDescription>
          </CardHeader>
          <CardContent>{renderCategoriesChart()}</CardContent>
        </Card>
      </div>

      {/* Análisis por Categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Categorías</CardTitle>
          <CardDescription>Desglose completo de gastos por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.categoriesData && reportData.categoriesData.length > 0 ? (
              reportData.categoriesData.map((category, index) => {
                const percentage =
                  reportData.summary.totalExpenses > 0 ? (category.amount / reportData.summary.totalExpenses) * 100 : 0
                return (
                  <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <h4 className="font-medium">{category.category}</h4>
                        <p className="text-sm text-gray-500">{percentage.toFixed(1)}% del total de gastos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(category.amount)}</div>
                      <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center text-gray-500 py-8">No hay datos de categorías para mostrar</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
