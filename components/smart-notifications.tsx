"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, AlertTriangle, X, CheckCircle, Info } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  period: string
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

interface Notification {
  id: string
  type: "warning" | "info" | "success" | "error"
  title: string
  message: string
  category: string
  priority: "high" | "medium" | "low"
  timestamp: Date
  dismissed: boolean
}

interface SmartNotificationsProps {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
}

export function SmartNotifications({ transactions, budgets, goals }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    generateNotifications()
  }, [transactions, budgets, goals])

  const generateNotifications = () => {
    const newNotifications: Notification[] = []

    // Análisis de gastos inusuales
    const recentTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return transactionDate >= weekAgo && t.type === "expense"
    })

    // Detectar gastos altos
    const averageExpense =
      recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / Math.max(recentTransactions.length, 1)
    const highExpenses = recentTransactions.filter((t) => Math.abs(t.amount) > averageExpense * 2)

    if (highExpenses.length > 0) {
      newNotifications.push({
        id: `high_expense_${Date.now()}`,
        type: "warning",
        title: "Gasto Inusual Detectado",
        message: `Has tenido ${highExpenses.length} gasto${highExpenses.length > 1 ? "s" : ""} por encima del promedio esta semana.`,
        category: "spending",
        priority: "high",
        timestamp: new Date(),
        dismissed: false,
      })
    }

    // Análisis de categorías con mayor gasto
    const categorySpending = new Map<string, number>()
    recentTransactions.forEach((t) => {
      const current = categorySpending.get(t.category) || 0
      categorySpending.set(t.category, current + Math.abs(t.amount))
    })

    const topCategory = Array.from(categorySpending.entries()).sort((a, b) => b[1] - a[1])[0]

    if (topCategory && topCategory[1] > averageExpense * 3) {
      newNotifications.push({
        id: `category_alert_${Date.now()}`,
        type: "info",
        title: "Categoría con Mayor Gasto",
        message: `Has gastado ${formatCurrency(topCategory[1])} en ${topCategory[0]} esta semana.`,
        category: "analysis",
        priority: "medium",
        timestamp: new Date(),
        dismissed: false,
      })
    }

    // Análisis de patrones de ingresos
    const recentIncome = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return transactionDate >= monthAgo && t.type === "income"
      })
      .reduce((sum, t) => sum + t.amount, 0)

    if (recentIncome > 0) {
      newNotifications.push({
        id: `income_summary_${Date.now()}`,
        type: "success",
        title: "Resumen de Ingresos",
        message: `Has recibido ${formatCurrency(recentIncome)} en ingresos este mes. ¡Buen trabajo!`,
        category: "income",
        priority: "low",
        timestamp: new Date(),
        dismissed: false,
      })
    }

    // Recordatorios de ahorro
    const totalExpenses = recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const savingsRate = recentIncome > 0 ? ((recentIncome - totalExpenses) / recentIncome) * 100 : 0

    if (savingsRate < 10 && recentIncome > 0) {
      newNotifications.push({
        id: `savings_reminder_${Date.now()}`,
        type: "warning",
        title: "Tasa de Ahorro Baja",
        message: `Tu tasa de ahorro es del ${savingsRate.toFixed(1)}%. Considera reducir algunos gastos.`,
        category: "savings",
        priority: "high",
        timestamp: new Date(),
        dismissed: false,
      })
    } else if (savingsRate >= 20) {
      newNotifications.push({
        id: `savings_good_${Date.now()}`,
        type: "success",
        title: "¡Excelente Ahorro!",
        message: `Tu tasa de ahorro es del ${savingsRate.toFixed(1)}%. ¡Sigue así!`,
        category: "savings",
        priority: "low",
        timestamp: new Date(),
        dismissed: false,
      })
    }

    // Análisis de tendencias
    const thisWeekExpenses = recentTransactions
      .filter((t) => {
        const transactionDate = new Date(t.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return transactionDate >= weekAgo
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const lastWeekExpenses = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date)
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return transactionDate >= twoWeeksAgo && transactionDate < weekAgo && t.type === "expense"
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    if (lastWeekExpenses > 0) {
      const changePercent = ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100

      if (changePercent > 20) {
        newNotifications.push({
          id: `trend_increase_${Date.now()}`,
          type: "warning",
          title: "Aumento en Gastos",
          message: `Tus gastos han aumentado un ${changePercent.toFixed(1)}% comparado con la semana pasada.`,
          category: "trends",
          priority: "medium",
          timestamp: new Date(),
          dismissed: false,
        })
      } else if (changePercent < -20) {
        newNotifications.push({
          id: `trend_decrease_${Date.now()}`,
          type: "success",
          title: "Reducción en Gastos",
          message: `¡Has reducido tus gastos un ${Math.abs(changePercent).toFixed(1)}% esta semana!`,
          category: "trends",
          priority: "low",
          timestamp: new Date(),
          dismissed: false,
        })
      }
    }

    setNotifications(newNotifications)
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n)))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-600" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "info":
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const activeNotifications = notifications.filter((n) => !n.dismissed)
  const displayNotifications = showAll ? activeNotifications : activeNotifications.slice(0, 3)

  if (activeNotifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            Notificaciones Inteligentes
          </CardTitle>
          <CardDescription>Todo está bajo control</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No hay notificaciones importantes en este momento.</p>
            <p className="text-sm text-gray-500 mt-2">Seguimos monitoreando tu actividad financiera.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notificaciones Inteligentes
              {activeNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeNotifications.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Análisis automático de tus patrones financieros</CardDescription>
          </div>
          {activeNotifications.length > 3 && (
            <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Ver menos" : `Ver todas (${activeNotifications.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayNotifications.map((notification) => (
            <Alert key={notification.id} className={getNotificationColor(notification.type)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          notification.priority === "high"
                            ? "border-red-300 text-red-700"
                            : notification.priority === "medium"
                              ? "border-yellow-300 text-yellow-700"
                              : "border-gray-300 text-gray-700"
                        }`}
                      >
                        {notification.priority === "high"
                          ? "Alta"
                          : notification.priority === "medium"
                            ? "Media"
                            : "Baja"}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">{notification.message}</AlertDescription>
                    <div className="text-xs text-gray-500 mt-2">
                      {notification.timestamp.toLocaleString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
