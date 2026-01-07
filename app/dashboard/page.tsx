"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  LogOut,
  Bell,
  Wallet,
  PieChart,
  Target,
  FileText,
  Menu,
  CheckCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AIInsights } from "@/components/ai-insights"
import { BudgetManagerComponent } from "@/components/budget-manager"
import { FinancialGoals } from "@/components/financial-goals"
import { SmartNotifications } from "@/components/smart-notifications"
import { ReportsDashboard } from "@/components/reports-dashboard"
import { AccountsDashboard } from "@/components/accounts-dashboard"
import { TransactionForm } from "@/components/transaction-form"

interface User {
  email: string
  name: string
  avatar?: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Salario Mensual",
      amount: 3500,
      category: "Salario",
      date: "2024-01-15",
      type: "income",
    },
    {
      id: "2",
      description: "Supermercado",
      amount: -120,
      category: "Alimentación",
      date: "2024-01-14",
      type: "expense",
    },
    {
      id: "3",
      description: "Gasolina",
      amount: -45,
      category: "Transporte",
      date: "2024-01-13",
      type: "expense",
    },
    {
      id: "4",
      description: "Freelance",
      amount: 800,
      category: "Ingresos Extra",
      date: "2024-01-12",
      type: "income",
    },
    {
      id: "5",
      description: "Netflix",
      amount: -15,
      category: "Entretenimiento",
      date: "2024-01-11",
      type: "expense",
    },
    {
      id: "6",
      description: "Compra en Amazon",
      amount: -89.99,
      category: "Compras",
      date: "2024-01-10",
      type: "expense",
    },
    {
      id: "7",
      description: "Dividendos",
      amount: 150,
      category: "Inversiones",
      date: "2024-01-09",
      type: "income",
    },
    {
      id: "8",
      description: "Restaurante",
      amount: -65,
      category: "Alimentación",
      date: "2024-01-08",
      type: "expense",
    },
  ])

  const [activeTab, setActiveTab] = useState<"overview" | "insights" | "budgets" | "goals" | "reports" | "accounts">(
    "overview",
  )

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const balance = totalIncome - totalExpenses

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const handleAddIncome = () => {
    const newTransaction: Transaction = {
      id: `trans_${Date.now()}`,
      description: "Nuevo Ingreso",
      amount: 0,
      category: "Ingresos",
      date: new Date().toISOString(),
      type: "income",
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const handleAddExpense = () => {
    const newTransaction: Transaction = {
      id: `trans_${Date.now()}`,
      description: "Nuevo Gasto",
      amount: 0,
      category: "Gastos",
      date: new Date().toISOString(),
      type: "expense",
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const navItems = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "insights", label: "Análisis", icon: PieChart },
    { id: "budgets", label: "Presupuestos", icon: Wallet },
    { id: "goals", label: "Metas", icon: Target },
    { id: "reports", label: "Reportes", icon: FileText },
    { id: "accounts", label: "Cuentas", icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="glass border-b sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5" />
              </Button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold hidden sm:block">JEVV</span>
              </button>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(item.id as any)}
                  className="btn-press"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
                <Settings className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 cursor-pointer" onClick={() => router.push("/settings")}>
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-primary text-white text-sm">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div
            className="fixed left-0 top-0 bottom-0 w-64 glass border-r p-6 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => {
                    setActiveTab(item.id as any)
                    setSidebarOpen(false)
                  }}
                  className="w-full justify-start btn-press"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-slide-in-up">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Hola, {user.name.split(" ")[0]} 👋</h1>
                <p className="text-muted-foreground">Aquí está tu resumen financiero</p>
              </div>
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </div>

            {/* Smart Notifications */}
            <SmartNotifications transactions={transactions} budgets={[]} goals={[]} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 card-hover border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-green-600 text-sm font-semibold">+12.5%</span>
                </div>
                <div className="text-3xl font-bold mb-1">${balance.toLocaleString()}</div>
                <div className="text-muted-foreground text-sm">Balance Total</div>
              </div>

              <div className="glass rounded-2xl p-6 card-hover border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-green-600 text-sm font-semibold">+8.2%</span>
                </div>
                <div className="text-3xl font-bold mb-1">${totalIncome.toLocaleString()}</div>
                <div className="text-muted-foreground text-sm">Ingresos</div>
              </div>

              <div className="glass rounded-2xl p-6 card-hover border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-red-600 text-sm font-semibold">-3.1%</span>
                </div>
                <div className="text-3xl font-bold mb-1">${totalExpenses.toLocaleString()}</div>
                <div className="text-muted-foreground text-sm">Gastos</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass rounded-2xl p-6 border">
              <h2 className="text-xl font-bold mb-4">Transacciones Recientes</h2>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === "income"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">{transaction.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && <AIInsights transactions={transactions} />}
        {activeTab === "budgets" && <BudgetManagerComponent transactions={transactions} />}
        {activeTab === "goals" && <FinancialGoals monthlyIncome={totalIncome} monthlyExpenses={totalExpenses} />}
        {activeTab === "reports" && <ReportsDashboard transactions={transactions} />}
        {activeTab === "accounts" && <AccountsDashboard />}
      </main>
    </div>
  )
}

function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nuevo ingreso registrado",
      message: "Se ha registrado un ingreso de $3,500",
      time: "Hace 5 min",
      read: false,
      type: "success",
    },
    {
      id: 2,
      title: "Presupuesto alcanzado",
      message: "Has alcanzado el 80% de tu presupuesto mensual",
      time: "Hace 2 horas",
      read: false,
      type: "warning",
    },
    {
      id: 3,
      title: "Meta completada",
      message: "¡Felicidades! Completaste tu meta de ahorro",
      time: "Ayer",
      read: true,
      type: "success",
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </Button>

      {showNotifications && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
          <div className="absolute right-0 top-12 w-80 glass border rounded-xl shadow-xl z-40 max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 glass">
              <h3 className="font-semibold">Notificaciones</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                  Marcar todas como leídas
                </Button>
              )}
            </div>

            <div className="divide-y">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-accent/50 transition-colors ${!notif.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${!notif.read ? "font-bold" : ""}`}>{notif.title}</h4>
                          {!notif.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notif.id)}
                            className="h-6 w-6 p-0"
                            title="Marcar como leída"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notif.id)}
                          className="h-6 w-6 p-0"
                          title="Eliminar"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
