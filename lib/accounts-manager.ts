// Sistema de gestión de cuentas y tarjetas
export interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "credit_card" | "investment" | "cash"
  balance: number
  currency: string
  bankName?: string
  accountNumber?: string
  isActive: boolean
  color: string
  icon: string
  createdAt: string
  lastUpdated: string
}

export interface AccountTransaction {
  id: string
  accountId: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense" | "transfer"
  transferToAccountId?: string
  balance: number
}

export interface AccountSummary {
  totalBalance: number
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  accountsByType: {
    checking: Account[]
    savings: Account[]
    credit_card: Account[]
    investment: Account[]
    cash: Account[]
  }
  monthlyChange: number
}

export class AccountsManager {
  private accounts: Account[]
  private transactions: AccountTransaction[]

  constructor(accounts: Account[] = [], transactions: AccountTransaction[] = []) {
    this.accounts = accounts
    this.transactions = transactions
  }

  // Crear nueva cuenta
  createAccount(
    name: string,
    type: Account["type"],
    initialBalance = 0,
    bankName?: string,
    accountNumber?: string,
  ): Account {
    const account: Account = {
      id: `account_${Date.now()}`,
      name,
      type,
      balance: initialBalance,
      currency: "USD",
      bankName,
      accountNumber,
      isActive: true,
      color: this.getDefaultColor(type),
      icon: this.getDefaultIcon(type),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    this.accounts.push(account)
    return account
  }

  // Actualizar balance de cuenta
  updateAccountBalance(accountId: string, newBalance: number): void {
    const account = this.accounts.find((a) => a.id === accountId)
    if (account) {
      account.balance = newBalance
      account.lastUpdated = new Date().toISOString()
    }
  }

  // Agregar transacción a cuenta
  addTransaction(
    accountId: string,
    description: string,
    amount: number,
    category: string,
    type: "income" | "expense" | "transfer",
    transferToAccountId?: string,
  ): AccountTransaction {
    const account = this.accounts.find((a) => a.id === accountId)
    if (!account) throw new Error("Cuenta no encontrada")

    // Actualizar balance
    const newBalance = account.balance + (type === "expense" ? -Math.abs(amount) : amount)
    this.updateAccountBalance(accountId, newBalance)

    const transaction: AccountTransaction = {
      id: `trans_${Date.now()}`,
      accountId,
      description,
      amount,
      category,
      date: new Date().toISOString(),
      type,
      transferToAccountId,
      balance: newBalance,
    }

    this.transactions.push(transaction)

    // Si es transferencia, actualizar cuenta destino
    if (type === "transfer" && transferToAccountId) {
      const targetAccount = this.accounts.find((a) => a.id === transferToAccountId)
      if (targetAccount) {
        this.updateAccountBalance(transferToAccountId, targetAccount.balance + Math.abs(amount))

        // Crear transacción en cuenta destino
        const transferTransaction: AccountTransaction = {
          id: `trans_${Date.now() + 1}`,
          accountId: transferToAccountId,
          description: `Transferencia desde ${account.name}`,
          amount: Math.abs(amount),
          category: "Transferencia",
          date: new Date().toISOString(),
          type: "transfer",
          transferToAccountId: accountId,
          balance: targetAccount.balance + Math.abs(amount),
        }
        this.transactions.push(transferTransaction)
      }
    }

    return transaction
  }

  // Obtener resumen de cuentas
  getAccountsSummary(): AccountSummary {
    const activeAccounts = this.accounts.filter((a) => a.isActive)

    const accountsByType = {
      checking: activeAccounts.filter((a) => a.type === "checking"),
      savings: activeAccounts.filter((a) => a.type === "savings"),
      credit_card: activeAccounts.filter((a) => a.type === "credit_card"),
      investment: activeAccounts.filter((a) => a.type === "investment"),
      cash: activeAccounts.filter((a) => a.type === "cash"),
    }

    const totalAssets = [
      ...accountsByType.checking,
      ...accountsByType.savings,
      ...accountsByType.investment,
      ...accountsByType.cash,
    ].reduce((sum, account) => sum + Math.max(0, account.balance), 0)

    const totalLiabilities = accountsByType.credit_card.reduce((sum, account) => sum + Math.max(0, -account.balance), 0)

    const totalBalance = activeAccounts.reduce((sum, account) => sum + account.balance, 0)
    const netWorth = totalAssets - totalLiabilities

    // Calcular cambio mensual
    const monthlyChange = this.calculateMonthlyChange()

    return {
      totalBalance,
      totalAssets,
      totalLiabilities,
      netWorth,
      accountsByType,
      monthlyChange,
    }
  }

  // Calcular cambio mensual
  private calculateMonthlyChange(): number {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    const recentTransactions = this.transactions.filter((t) => new Date(t.date) >= lastMonth && t.type !== "transfer")

    return recentTransactions.reduce((sum, t) => {
      return sum + (t.type === "income" ? t.amount : -Math.abs(t.amount))
    }, 0)
  }

  // Obtener transacciones de cuenta
  getAccountTransactions(accountId: string, limit?: number): AccountTransaction[] {
    const accountTransactions = this.transactions
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return limit ? accountTransactions.slice(0, limit) : accountTransactions
  }

  // Obtener todas las cuentas activas
  getActiveAccounts(): Account[] {
    return this.accounts.filter((a) => a.isActive)
  }

  // Desactivar cuenta
  deactivateAccount(accountId: string): void {
    const account = this.accounts.find((a) => a.id === accountId)
    if (account) {
      account.isActive = false
      account.lastUpdated = new Date().toISOString()
    }
  }

  // Actualizar información de cuenta
  updateAccount(accountId: string, updates: Partial<Account>): void {
    const account = this.accounts.find((a) => a.id === accountId)
    if (account) {
      Object.assign(account, updates, { lastUpdated: new Date().toISOString() })
    }
  }

  // Obtener balance total por tipo
  getBalanceByType(type: Account["type"]): number {
    return this.accounts.filter((a) => a.type === type && a.isActive).reduce((sum, account) => sum + account.balance, 0)
  }

  // Colores por defecto según tipo de cuenta
  private getDefaultColor(type: Account["type"]): string {
    const colors = {
      checking: "#3B82F6", // Blue
      savings: "#10B981", // Green
      credit_card: "#EF4444", // Red
      investment: "#8B5CF6", // Purple
      cash: "#F59E0B", // Amber
    }
    return colors[type]
  }

  // Iconos por defecto según tipo de cuenta
  private getDefaultIcon(type: Account["type"]): string {
    const icons = {
      checking: "Wallet",
      savings: "PiggyBank",
      credit_card: "CreditCard",
      investment: "TrendingUp",
      cash: "Banknote",
    }
    return icons[type]
  }

  // Generar reporte de cuenta específica
  generateAccountReport(accountId: string, months = 6) {
    const account = this.accounts.find((a) => a.id === accountId)
    if (!account) return null

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const accountTransactions = this.transactions.filter(
      (t) => t.accountId === accountId && new Date(t.date) >= startDate,
    )

    const totalIncome = accountTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = accountTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalTransfers = accountTransactions
      .filter((t) => t.type === "transfer")
      .reduce((sum, t) => sum + t.amount, 0)

    // Análisis mensual
    const monthlyData = new Map<string, { income: number; expenses: number; transfers: number }>()

    accountTransactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0, transfers: 0 })
      }

      const monthData = monthlyData.get(monthKey)!
      if (t.type === "income") monthData.income += t.amount
      else if (t.type === "expense") monthData.expenses += Math.abs(t.amount)
      else if (t.type === "transfer") monthData.transfers += t.amount
    })

    return {
      account,
      period: `${startDate.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      summary: {
        totalIncome,
        totalExpenses,
        totalTransfers,
        netChange: totalIncome - totalExpenses + totalTransfers,
        transactionCount: accountTransactions.length,
      },
      monthlyData: Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        ...data,
        net: data.income - data.expenses + data.transfers,
      })),
      recentTransactions: accountTransactions.slice(0, 10),
    }
  }
}
