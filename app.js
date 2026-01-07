import { Chart } from "@/components/ui/chart"
// Financial App - Main JavaScript File

// Global Variables
let currentUser = null
let transactions = []
let budgets = []
let goals = []
let accounts = []
let currentTab = "overview"
const currentDate = new Date()

// Sample Data
const sampleTransactions = [
  {
    id: 1,
    date: "2024-01-15",
    description: "Supermercado Central",
    category: "food",
    account: "checking",
    amount: -85.5,
    type: "expense",
  },
  {
    id: 2,
    date: "2024-01-14",
    description: "Salario Enero",
    category: "income",
    account: "checking",
    amount: 3500.0,
    type: "income",
  },
  {
    id: 3,
    date: "2024-01-13",
    description: "Gasolina Shell",
    category: "transport",
    account: "credit",
    amount: -45.0,
    type: "expense",
  },
  {
    id: 4,
    date: "2024-01-12",
    description: "Netflix Suscripción",
    category: "entertainment",
    account: "checking",
    amount: -15.99,
    type: "expense",
  },
  {
    id: 5,
    date: "2024-01-11",
    description: "Farmacia San Pablo",
    category: "health",
    account: "checking",
    amount: -32.75,
    type: "expense",
  },
]

const sampleBudgets = [
  {
    id: 1,
    category: "food",
    name: "Alimentación",
    budget: 800,
    spent: 425.5,
    icon: "fas fa-utensils",
    color: "#f59e0b",
  },
  {
    id: 2,
    category: "transport",
    name: "Transporte",
    budget: 300,
    spent: 180.0,
    icon: "fas fa-car",
    color: "#06b6d4",
  },
  {
    id: 3,
    category: "entertainment",
    name: "Entretenimiento",
    budget: 200,
    spent: 95.99,
    icon: "fas fa-film",
    color: "#ef4444",
  },
  {
    id: 4,
    category: "utilities",
    name: "Servicios",
    budget: 400,
    spent: 320.0,
    icon: "fas fa-bolt",
    color: "#64748b",
  },
]

const sampleGoals = [
  {
    id: 1,
    name: "Fondo de Emergencia",
    target: 10000,
    current: 6500,
    deadline: "2024-12-31",
    icon: "fas fa-shield-alt",
    color: "#10b981",
  },
  {
    id: 2,
    name: "Vacaciones Europa",
    target: 5000,
    current: 2800,
    deadline: "2024-08-15",
    icon: "fas fa-plane",
    color: "#3b82f6",
  },
  {
    id: 3,
    name: "Auto Nuevo",
    target: 25000,
    current: 8500,
    deadline: "2025-06-30",
    icon: "fas fa-car",
    color: "#f59e0b",
  },
]

const sampleAccounts = [
  {
    id: 1,
    name: "Cuenta Corriente",
    type: "checking",
    balance: 15430.5,
    change: 5.2,
    icon: "fas fa-university",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Cuenta de Ahorros",
    type: "savings",
    balance: 8500.0,
    change: 12.0,
    icon: "fas fa-piggy-bank",
    color: "#10b981",
  },
  {
    id: 3,
    name: "Tarjeta de Crédito",
    type: "credit",
    balance: -1500.0,
    change: -8.0,
    icon: "fas fa-credit-card",
    color: "#ef4444",
  },
  {
    id: 4,
    name: "Inversiones",
    type: "investment",
    balance: 2000.0,
    change: 15.0,
    icon: "fas fa-chart-line",
    color: "#f59e0b",
  },
]

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  const icon = toast.querySelector(".toast-icon")
  const messageEl = toast.querySelector(".toast-message")

  // Set icon based on type
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  }

  icon.className = `toast-icon ${icons[type]}`
  messageEl.textContent = message
  toast.className = `toast ${type} show`

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

// Authentication Functions
function showLogin() {
  document.getElementById("login-screen").classList.remove("hidden")
  document.getElementById("register-screen").classList.add("hidden")
}

function showRegister() {
  document.getElementById("register-screen").classList.remove("hidden")
  document.getElementById("login-screen").classList.add("hidden")
}

function login(email, password) {
  // Simulate login
  if (email === "demo@financeapp.com" && password === "demo123") {
    currentUser = {
      id: 1,
      name: "Juan Pérez",
      email: email,
    }

    // Load sample data
    transactions = [...sampleTransactions]
    budgets = [...sampleBudgets]
    goals = [...sampleGoals]
    accounts = [...sampleAccounts]

    // Hide auth screens and show dashboard
    document.getElementById("login-screen").classList.add("hidden")
    document.getElementById("loading-screen").classList.add("hidden")
    document.getElementById("dashboard").classList.remove("hidden")

    // Initialize dashboard
    initializeDashboard()
    showToast("¡Bienvenido de vuelta!", "success")

    return true
  }

  showToast("Credenciales incorrectas", "error")
  return false
}

function logout() {
  currentUser = null
  transactions = []
  budgets = []
  goals = []
  accounts = []

  document.getElementById("dashboard").classList.add("hidden")
  document.getElementById("login-screen").classList.remove("hidden")
  showToast("Sesión cerrada correctamente", "info")
}

// Dashboard Functions
function initializeDashboard() {
  updateSummaryCards()
  renderRecentTransactions()
  renderBudgetCategories()
  renderGoals()
  renderAccounts()
  renderCalendar()
  renderAIInsights()
  initializeCharts()

  // Set current date for transaction form
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("transaction-date").value = today
}

function switchTab(tabName) {
  // Update navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  // Update content
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active")
  })
  document.getElementById(`${tabName}-tab`).classList.add("active")

  // Update header
  const titles = {
    overview: "Resumen Financiero",
    transactions: "Transacciones",
    budget: "Gestión de Presupuesto",
    goals: "Metas Financieras",
    accounts: "Gestión de Cuentas",
    reports: "Reportes y Analytics",
    calendar: "Calendario Financiero",
    "ai-insights": "Insights de IA",
  }

  document.getElementById("page-title").textContent = titles[tabName]
  currentTab = tabName

  // Refresh charts if needed
  if (tabName === "reports") {
    setTimeout(initializeReportCharts, 100)
  }
}

function updateSummaryCards() {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))
  const totalSavings = totalIncome - totalExpenses

  // Update balance card
  const balanceCard = document.querySelector(".summary-card.balance .card-value")
  if (balanceCard) balanceCard.textContent = formatCurrency(totalBalance)

  // Update income card
  const incomeCard = document.querySelector(".summary-card.income .card-value")
  if (incomeCard) incomeCard.textContent = formatCurrency(totalIncome)

  // Update expenses card
  const expensesCard = document.querySelector(".summary-card.expenses .card-value")
  if (expensesCard) expensesCard.textContent = formatCurrency(totalExpenses)

  // Update savings card
  const savingsCard = document.querySelector(".summary-card.savings .card-value")
  if (savingsCard) savingsCard.textContent = formatCurrency(totalSavings)
}

function renderRecentTransactions() {
  const container = document.getElementById("recent-transactions-list")
  if (!container) return

  const recentTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  container.innerHTML = recentTransactions
    .map(
      (transaction) => `
        <div class="transaction-item">
            <div class="transaction-icon ${transaction.category}">
                <i class="${getCategoryIcon(transaction.category)}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-category">${getCategoryName(transaction.category)}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${formatCurrency(Math.abs(transaction.amount))}
            </div>
            <div class="transaction-date">
                ${formatDate(transaction.date)}
            </div>
        </div>
    `,
    )
    .join("")
}

function renderTransactionsTable() {
  const container = document.getElementById("transactions-table-body")
  if (!container) return

  let filteredTransactions = [...transactions]

  // Apply filters
  const searchTerm = document.getElementById("transaction-search")?.value.toLowerCase() || ""
  const categoryFilter = document.getElementById("category-filter")?.value || ""
  const dateFilter = document.getElementById("date-filter")?.value || ""

  if (searchTerm) {
    filteredTransactions = filteredTransactions.filter((t) => t.description.toLowerCase().includes(searchTerm))
  }

  if (categoryFilter) {
    filteredTransactions = filteredTransactions.filter((t) => t.category === categoryFilter)
  }

  if (dateFilter && dateFilter !== "all") {
    const now = new Date()
    const filterDate = new Date()

    switch (dateFilter) {
      case "today":
        filterDate.setHours(0, 0, 0, 0)
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= filterDate)
        break
      case "week":
        filterDate.setDate(now.getDate() - 7)
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= filterDate)
        break
      case "month":
        filterDate.setMonth(now.getMonth() - 1)
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= filterDate)
        break
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1)
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= filterDate)
        break
    }
  }

  // Sort by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  container.innerHTML = filteredTransactions
    .map(
      (transaction) => `
        <div class="table-row">
            <div class="table-cell date" data-label="Fecha">
                ${formatDate(transaction.date)}
            </div>
            <div class="table-cell description" data-label="Descripción">
                ${transaction.description}
            </div>
            <div class="table-cell category" data-label="Categoría">
                <span class="category-badge ${transaction.category}">
                    ${getCategoryName(transaction.category)}
                </span>
            </div>
            <div class="table-cell account" data-label="Cuenta">
                ${getAccountName(transaction.account)}
            </div>
            <div class="table-cell amount ${transaction.type}" data-label="Monto">
                ${transaction.type === "expense" ? "-" : "+"}${formatCurrency(Math.abs(transaction.amount))}
            </div>
            <div class="table-cell actions" data-label="Acciones">
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function renderBudgetCategories() {
  const container = document.getElementById("budget-categories")
  if (!container) return

  container.innerHTML = budgets
    .map((budget) => {
      const percentage = (budget.spent / budget.budget) * 100
      const remaining = budget.budget - budget.spent
      const isOverBudget = budget.spent > budget.budget

      return `
            <div class="budget-category">
                <div class="category-header">
                    <div class="category-info">
                        <div class="category-icon" style="background: ${budget.color}">
                            <i class="${budget.icon}"></i>
                        </div>
                        <div class="category-name">${budget.name}</div>
                    </div>
                    <div class="category-amounts">
                        <span class="spent-amount">${formatCurrency(budget.spent)}</span>
                        <span class="budget-amount">/ ${formatCurrency(budget.budget)}</span>
                    </div>
                </div>
                <div class="category-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background: ${isOverBudget ? "#ef4444" : budget.color}"></div>
                    </div>
                </div>
                <div class="category-status">
                    <span>${Math.round(percentage)}% utilizado</span>
                    <span class="${isOverBudget ? "over-budget" : "remaining-amount"}">
                        ${isOverBudget ? "Excedido por " + formatCurrency(Math.abs(remaining)) : "Disponible " + formatCurrency(remaining)}
                    </span>
                </div>
            </div>
        `
    })
    .join("")
}

function renderGoals() {
  const container = document.getElementById("goals-grid")
  if (!container) return

  container.innerHTML = goals
    .map((goal) => {
      const percentage = (goal.current / goal.target) * 100
      const remaining = goal.target - goal.current
      const deadline = new Date(goal.deadline)
      const today = new Date()
      const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))

      let deadlineStatus = "on-track"
      let deadlineText = `${daysRemaining} días restantes`

      if (daysRemaining < 0) {
        deadlineStatus = "overdue"
        deadlineText = `Vencido hace ${Math.abs(daysRemaining)} días`
      } else if (daysRemaining < 30) {
        deadlineStatus = "behind"
      }

      return `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-icon" style="background: ${goal.color}">
                        <i class="${goal.icon}"></i>
                    </div>
                    <div class="goal-info">
                        <h3>${goal.name}</h3>
                        <div class="goal-target">Meta: ${formatCurrency(goal.target)}</div>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="goal-amounts">
                        <div class="current-amount">${formatCurrency(goal.current)}</div>
                        <div class="target-amount">${formatCurrency(goal.target)}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background: ${goal.color}"></div>
                    </div>
                    <div class="progress-percentage">${Math.round(percentage)}% completado</div>
                </div>
                <div class="goal-deadline">
                    <span class="deadline-text">Fecha límite: ${formatDate(goal.deadline)}</span>
                    <span class="deadline-status ${deadlineStatus}">${deadlineText}</span>
                </div>
            </div>
        `
    })
    .join("")
}

function renderAccounts() {
  const container = document.getElementById("accounts-grid")
  if (!container) return

  container.innerHTML = accounts
    .map(
      (account) => `
        <div class="account-card">
            <div class="account-header">
                <div class="account-info">
                    <div class="account-icon ${account.type}">
                        <i class="${account.icon}"></i>
                    </div>
                    <div class="account-details">
                        <h3>${account.name}</h3>
                        <div class="account-type">${getAccountTypeName(account.type)}</div>
                    </div>
                </div>
                <button class="account-menu">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <div class="account-balance ${account.balance < 0 ? "negative" : ""}">
                ${formatCurrency(account.balance)}
            </div>
            <div class="account-change ${account.change >= 0 ? "positive" : "negative"}">
                <i class="fas fa-arrow-${account.change >= 0 ? "up" : "down"}"></i>
                ${account.change >= 0 ? "+" : ""}${account.change}% este mes
            </div>
        </div>
    `,
    )
    .join("")
}

function renderCalendar() {
  const container = document.getElementById("calendar-grid")
  if (!container) return

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Update month/year display
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const monthYearEl = document.getElementById("calendar-month-year")
  if (monthYearEl) {
    monthYearEl.textContent = `${monthNames[month]} ${year}`
  }

  // Generate calendar
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  let calendarHTML = ""

  // Header
  days.forEach((day) => {
    calendarHTML += `<div class="calendar-header-cell">${day}</div>`
  })

  // Calendar days
  const currentDateObj = new Date()
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate)
    cellDate.setDate(startDate.getDate() + i)

    const isCurrentMonth = cellDate.getMonth() === month
    const isToday = cellDate.toDateString() === currentDateObj.toDateString()
    const dayEvents = getEventsForDate(cellDate)

    calendarHTML += `
            <div class="calendar-cell ${!isCurrentMonth ? "other-month" : ""} ${isToday ? "today" : ""}" 
                 data-date="${cellDate.toISOString().split("T")[0]}">
                <div class="calendar-date">${cellDate.getDate()}</div>
                <div class="calendar-events">
                    ${dayEvents
                      .map(
                        (event) => `
                        <div class="calendar-event ${event.type}">${event.title}</div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `
  }

  container.innerHTML = calendarHTML

  // Render upcoming events
  renderUpcomingEvents()
}

function getEventsForDate(date) {
  const events = []
  const dateStr = date.toISOString().split("T")[0]

  // Add transactions as events
  const dayTransactions = transactions.filter((t) => t.date === dateStr)
  dayTransactions.forEach((transaction) => {
    events.push({
      type: transaction.type === "income" ? "income" : "expense",
      title: transaction.description.substring(0, 15) + (transaction.description.length > 15 ? "..." : ""),
      amount: transaction.amount,
    })
  })

  // Add sample recurring events
  const day = date.getDate()
  if (day === 1) {
    events.push({ type: "bill", title: "Renta", amount: -1200 })
  }
  if (day === 15) {
    events.push({ type: "income", title: "Salario", amount: 3500 })
  }
  if (day === 5) {
    events.push({ type: "bill", title: "Electricidad", amount: -120 })
  }

  return events.slice(0, 3) // Limit to 3 events per day
}

function renderUpcomingEvents() {
  const container = document.getElementById("upcoming-events-list")
  if (!container) return

  const upcomingEvents = [
    {
      date: "2024-01-20",
      title: "Pago de Renta",
      description: "Pago mensual del apartamento",
      amount: -1200,
      type: "expense",
    },
    {
      date: "2024-01-25",
      title: "Factura de Luz",
      description: "Pago de electricidad",
      amount: -120,
      type: "expense",
    },
    {
      date: "2024-01-30",
      title: "Salario",
      description: "Pago de nómina",
      amount: 3500,
      type: "income",
    },
  ]

  container.innerHTML = upcomingEvents
    .map((event) => {
      const eventDate = new Date(event.date)
      return `
            <div class="event-item">
                <div class="event-date">
                    <div class="event-day">${eventDate.getDate()}</div>
                    <div class="event-month">${eventDate.toLocaleDateString("es-ES", { month: "short" })}</div>
                </div>
                <div class="event-details">
                    <div class="event-title">${event.title}</div>
                    <div class="event-description">${event.description}</div>
                </div>
                <div class="event-amount ${event.type}">
                    ${formatCurrency(Math.abs(event.amount))}
                </div>
            </div>
        `
    })
    .join("")
}

function renderAIInsights() {
  const container = document.getElementById("insights-grid")
  if (!container) return

  const insights = [
    {
      title: "Patrón de Gastos Detectado",
      content: "Tus gastos en alimentación han aumentado 15% este mes. Considera revisar tus hábitos de compra.",
      action: "Ver Detalles",
      icon: "fas fa-chart-line",
    },
    {
      title: "Oportunidad de Ahorro",
      content: "Podrías ahorrar $200 mensuales optimizando tus suscripciones y servicios no utilizados.",
      action: "Optimizar",
      icon: "fas fa-lightbulb",
    },
    {
      title: "Meta en Riesgo",
      content: 'Tu meta de "Vacaciones Europa" está retrasada. Necesitas ahorrar $150 más por mes.',
      action: "Ajustar Plan",
      icon: "fas fa-exclamation-triangle",
    },
    {
      title: "Predicción Positiva",
      content: "Basado en tus patrones, podrás alcanzar tu fondo de emergencia 2 meses antes de lo planeado.",
      action: "Ver Proyección",
      icon: "fas fa-trophy",
    },
  ]

  container.innerHTML = insights
    .map(
      (insight) => `
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-title">${insight.title}</div>
            </div>
            <div class="insight-content">${insight.content}</div>
            <button class="insight-action">${insight.action}</button>
        </div>
    `,
    )
    .join("")
}

// Chart Functions
function initializeCharts() {
  initializeCashflowChart()
  initializeExpensesChart()
}

function initializeCashflowChart() {
  const ctx = document.getElementById("cashflow-chart")
  if (!ctx) return

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      datasets: [
        {
          label: "Ingresos",
          data: [3200, 3500, 3300, 3600, 3400, 3500],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
        },
        {
          label: "Gastos",
          data: [2800, 3100, 2900, 3200, 3000, 3100],
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => "$" + value.toLocaleString(),
          },
        },
      },
    },
  })
}

function initializeExpensesChart() {
  const ctx = document.getElementById("expenses-chart")
  if (!ctx) return

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Alimentación", "Transporte", "Entretenimiento", "Servicios", "Otros"],
      datasets: [
        {
          data: [425, 180, 96, 320, 200],
          backgroundColor: ["#f59e0b", "#06b6d4", "#ef4444", "#64748b", "#8b5cf6"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  })
}

function initializeReportCharts() {
  initializeSpendingAnalysisChart()
  initializeIncomeTrendChart()
}

function initializeSpendingAnalysisChart() {
  const ctx = document.getElementById("spending-analysis-chart")
  if (!ctx) return

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
      datasets: [
        {
          label: "Gastos por Mes",
          data: [2800, 3100, 2900, 3200, 3000, 3100],
          backgroundColor: "#3b82f6",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => "$" + value.toLocaleString(),
          },
        },
      },
    },
  })
}

function initializeIncomeTrendChart() {
  const ctx = document.getElementById("income-trend-chart")
  if (!ctx) return

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
      datasets: [
        {
          label: "Ingresos por Mes",
          data: [3200, 3500, 3300, 3600, 3400, 3500],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => "$" + value.toLocaleString(),
          },
        },
      },
    },
  })
}

// Transaction Functions
function addTransaction(transactionData) {
  const newTransaction = {
    id: generateId(),
    ...transactionData,
    amount: transactionData.type === "expense" ? -Math.abs(transactionData.amount) : Math.abs(transactionData.amount),
  }

  transactions.unshift(newTransaction)

  // Update account balance
  const account = accounts.find((a) => a.type === transactionData.account)
  if (account) {
    account.balance += newTransaction.amount
  }

  // Update budget if expense
  if (transactionData.type === "expense") {
    const budget = budgets.find((b) => b.category === transactionData.category)
    if (budget) {
      budget.spent += Math.abs(newTransaction.amount)
    }
  }

  // Refresh displays
  updateSummaryCards()
  renderRecentTransactions()
  renderTransactionsTable()
  renderBudgetCategories()
  renderAccounts()

  showToast("Transacción agregada correctamente", "success")
}

function editTransaction(id) {
  const transaction = transactions.find((t) => t.id === id)
  if (!transaction) return

  // Populate form with transaction data
  document.getElementById("transaction-type").value = transaction.type
  document.getElementById("transaction-amount").value = Math.abs(transaction.amount)
  document.getElementById("transaction-description").value = transaction.description
  document.getElementById("transaction-category").value = transaction.category
  document.getElementById("transaction-account").value = transaction.account
  document.getElementById("transaction-date").value = transaction.date

  // Show modal
  document.getElementById("transaction-modal").classList.add("active")

  // Store transaction ID for update
  document.getElementById("transaction-form").dataset.editId = id
}

function deleteTransaction(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta transacción?")) return

  const transactionIndex = transactions.findIndex((t) => t.id === id)
  if (transactionIndex === -1) return

  const transaction = transactions[transactionIndex]

  // Update account balance
  const account = accounts.find((a) => a.type === transaction.account)
  if (account) {
    account.balance -= transaction.amount
  }

  // Update budget if expense
  if (transaction.type === "expense") {
    const budget = budgets.find((b) => b.category === transaction.category)
    if (budget) {
      budget.spent -= Math.abs(transaction.amount)
    }
  }

  // Remove transaction
  transactions.splice(transactionIndex, 1)

  // Refresh displays
  updateSummaryCards()
  renderRecentTransactions()
  renderTransactionsTable()
  renderBudgetCategories()
  renderAccounts()

  showToast("Transacción eliminada correctamente", "success")
}

// Helper Functions
function getCategoryIcon(category) {
  const icons = {
    food: "fas fa-utensils",
    transport: "fas fa-car",
    entertainment: "fas fa-film",
    utilities: "fas fa-bolt",
    shopping: "fas fa-shopping-bag",
    health: "fas fa-heartbeat",
    income: "fas fa-dollar-sign",
  }
  return icons[category] || "fas fa-circle"
}

function getCategoryName(category) {
  const names = {
    food: "Alimentación",
    transport: "Transporte",
    entertainment: "Entretenimiento",
    utilities: "Servicios",
    shopping: "Compras",
    health: "Salud",
    income: "Ingresos",
  }
  return names[category] || category
}

function getAccountName(account) {
  const names = {
    checking: "Cuenta Corriente",
    savings: "Ahorros",
    credit: "Tarjeta de Crédito",
    investment: "Inversiones",
    cash: "Efectivo",
  }
  return names[account] || account
}

function getAccountTypeName(type) {
  const names = {
    checking: "Cuenta Corriente",
    savings: "Cuenta de Ahorros",
    credit: "Tarjeta de Crédito",
    investment: "Cuenta de Inversión",
    cash: "Efectivo",
  }
  return names[type] || type
}

// AI Chat Functions
function sendChatMessage() {
  const input = document.getElementById("chat-input")
  const message = input.value.trim()
  if (!message) return

  // Add user message
  addChatMessage(message, "user")
  input.value = ""

  // Simulate AI response
  setTimeout(() => {
    const response = generateAIResponse(message)
    addChatMessage(response, "ai")
  }, 1000)
}

function addChatMessage(message, sender) {
  const container = document.getElementById("chat-container")
  const messageEl = document.createElement("div")
  messageEl.className = `chat-message ${sender}`

  messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === "ai" ? "robot" : "user"}"></i>
        </div>
        <div class="message-content">${message}</div>
    `

  container.appendChild(messageEl)
  container.scrollTop = container.scrollHeight
}

function generateAIResponse(message) {
  const responses = {
    gastos:
      "Tus gastos principales este mes son: Alimentación ($425), Servicios ($320), y Transporte ($180). ¿Te gustaría que analice alguna categoría específica?",
    ahorros:
      "Tu tasa de ahorro actual es del 62%. ¡Excelente trabajo! Para optimizar aún más, podrías revisar tus suscripciones no utilizadas.",
    presupuesto:
      "Tu presupuesto está 65% utilizado. Tienes $1,759 disponibles este mes. La categoría de Servicios está cerca del límite.",
    metas:
      "Tienes 3 metas activas. Tu Fondo de Emergencia va muy bien (65% completado), pero las Vacaciones Europa necesitan más atención.",
    ingresos:
      "Tus ingresos han sido consistentes con un promedio de $3,500 mensuales. Considera diversificar tus fuentes de ingreso.",
    default:
      "Puedo ayudarte con información sobre tus gastos, ahorros, presupuesto, metas financieras e ingresos. ¿Sobre qué te gustaría saber más?",
  }

  const lowerMessage = message.toLowerCase()
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response
    }
  }

  return responses.default
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Show loading screen initially
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden")
    document.getElementById("login-screen").classList.remove("hidden")
  }, 2000)

  // Auth form handlers
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value
    login(email, password)
  })

  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault()
    showToast("Registro completado. Usa las credenciales demo para acceder.", "success")
    showLogin()
  })

  // Auth navigation
  document.getElementById("show-register").addEventListener("click", (e) => {
    e.preventDefault()
    showRegister()
  })

  document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault()
    showLogin()
  })

  // Password toggle
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input")
      const icon = this.querySelector("i")

      if (input.type === "password") {
        input.type = "text"
        icon.className = "fas fa-eye-slash"
      } else {
        input.type = "password"
        icon.className = "fas fa-eye"
      }
    })
  })

  // Password strength checker
  document.getElementById("register-password")?.addEventListener("input", function () {
    const password = this.value
    const strengthBar = document.querySelector(".strength-fill")
    const strengthText = document.querySelector(".strength-text")

    let strength = 0
    let text = "Muy débil"

    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    switch (strength) {
      case 0:
      case 1:
        strengthBar.className = "strength-fill weak"
        text = "Débil"
        break
      case 2:
        strengthBar.className = "strength-fill fair"
        text = "Regular"
        break
      case 3:
        strengthBar.className = "strength-fill good"
        text = "Buena"
        break
      case 4:
        strengthBar.className = "strength-fill strong"
        text = "Fuerte"
        break
    }

    strengthText.textContent = text
  })

  // Navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      const tab = this.dataset.tab
      switchTab(tab)
    })
  })

  // Logout
  document.getElementById("logout-btn").addEventListener("click", logout)

  // Theme toggle
  document.getElementById("theme-toggle").addEventListener("click", function () {
    const body = document.body
    const icon = this.querySelector("i")

    if (body.dataset.theme === "dark") {
      body.dataset.theme = "light"
      icon.className = "fas fa-moon"
    } else {
      body.dataset.theme = "dark"
      icon.className = "fas fa-sun"
    }
  })

  // Sidebar toggle for mobile
  document.querySelector(".sidebar-toggle")?.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open")
  })

  // Transaction modal
  document.getElementById("add-transaction-btn")?.addEventListener("click", () => {
    document.getElementById("transaction-form").reset()
    document.getElementById("transaction-form").removeAttribute("data-edit-id")
    document.getElementById("transaction-date").value = new Date().toISOString().split("T")[0]
    document.getElementById("transaction-modal").classList.add("active")
  })

  // Transaction form
  document.getElementById("transaction-form")?.addEventListener("submit", function (e) {
    e.preventDefault()

    const formData = {
      type: document.getElementById("transaction-type").value,
      amount: Number.parseFloat(document.getElementById("transaction-amount").value),
      description: document.getElementById("transaction-description").value,
      category: document.getElementById("transaction-category").value,
      account: document.getElementById("transaction-account").value,
      date: document.getElementById("transaction-date").value,
    }

    const editId = this.dataset.editId
    if (editId) {
      // Update existing transaction
      const transactionIndex = transactions.findIndex((t) => t.id == editId)
      if (transactionIndex !== -1) {
        const oldTransaction = transactions[transactionIndex]

        // Revert old transaction effects
        const account = accounts.find((a) => a.type === oldTransaction.account)
        if (account) {
          account.balance -= oldTransaction.amount
        }

        if (oldTransaction.type === "expense") {
          const budget = budgets.find((b) => b.category === oldTransaction.category)
          if (budget) {
            budget.spent -= Math.abs(oldTransaction.amount)
          }
        }

        // Apply new transaction
        const newAmount = formData.type === "expense" ? -Math.abs(formData.amount) : Math.abs(formData.amount)
        transactions[transactionIndex] = {
          ...oldTransaction,
          ...formData,
          amount: newAmount,
        }

        // Apply new transaction effects
        const newAccount = accounts.find((a) => a.type === formData.account)
        if (newAccount) {
          newAccount.balance += newAmount
        }

        if (formData.type === "expense") {
          const newBudget = budgets.find((b) => b.category === formData.category)
          if (newBudget) {
            newBudget.spent += Math.abs(newAmount)
          }
        }

        showToast("Transacción actualizada correctamente", "success")
      }
    } else {
      addTransaction(formData)
    }

    // Close modal and refresh
    document.getElementById("transaction-modal").classList.remove("active")
    updateSummaryCards()
    renderRecentTransactions()
    renderTransactionsTable()
    renderBudgetCategories()
    renderAccounts()
  })

  // Modal close handlers
  document.querySelectorAll(".close-modal, .cancel-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.closest(".modal").classList.remove("active")
    })
  })

  // Modal backdrop close
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active")
      }
    })
  })

  // Search and filters
  document.getElementById("transaction-search")?.addEventListener("input", renderTransactionsTable)
  document.getElementById("category-filter")?.addEventListener("change", renderTransactionsTable)
  document.getElementById("date-filter")?.addEventListener("change", renderTransactionsTable)

  // Calendar navigation
  document.getElementById("prev-month")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1)
    renderCalendar()
  })

  document.getElementById("next-month")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1)
    renderCalendar()
  })

  // AI Chat
  document.getElementById("send-chat-btn")?.addEventListener("click", sendChatMessage)
  document.getElementById("chat-input")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatMessage()
    }
  })

  // Export functionality
  document.getElementById("export-report-btn")?.addEventListener("click", () => {
    showToast("Reporte exportado correctamente", "success")
  })

  // Refresh insights
  document.getElementById("refresh-insights-btn")?.addEventListener("click", () => {
    renderAIInsights()
    showToast("Insights actualizados", "success")
  })
})

// Initialize when page loads
window.addEventListener("load", () => {
  // Auto-login for demo
  setTimeout(() => {
    if (!currentUser) {
      login("demo@financeapp.com", "demo123")
    }
  }, 3000)
})
