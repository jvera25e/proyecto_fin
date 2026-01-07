"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "credit" | "investment" | "loan"
  balance: number
  currency: string
  bank: string
  accountNumber: string
  isActive: boolean
  lastUpdated: string
  creditLimit?: number
  interestRate?: number
  minimumPayment?: number
  dueDate?: string
}

interface AccountsDashboardProps {
  accounts?: Account[]
  onAddAccount?: (account: Omit<Account, "id">) => void
  onUpdateAccount?: (id: string, updates: Partial<Account>) => void
}

const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: "1",
    name: "Cuenta Corriente Principal",
    type: "checking",
    balance: 5420.5,
    currency: "USD",
    bank: "Banco Nacional",
    accountNumber: "****1234",
    isActive: true,
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Cuenta de Ahorros",
    type: "savings",
    balance: 12800.0,
    currency: "USD",
    bank: "Banco Nacional",
    accountNumber: "****5678",
    isActive: true,
    lastUpdated: "2024-01-15T10:30:00Z",
    interestRate: 2.5,
  },
  {
    id: "3",
    name: "Tarjeta de Crédito Visa",
    type: "credit",
    balance: -1250.75,
    currency: "USD",
    bank: "Banco Crédito",
    accountNumber: "****9012",
    isActive: true,
    lastUpdated: "2024-01-14T15:45:00Z",
    creditLimit: 5000,
    minimumPayment: 125,
    dueDate: "2024-01-25",
  },
  {
    id: "4",
    name: "Inversiones",
    type: "investment",
    balance: 25600.3,
    currency: "USD",
    bank: "Broker Inversiones",
    accountNumber: "****3456",
    isActive: true,
    lastUpdated: "2024-01-15T09:00:00Z",
    interestRate: 7.2,
  },
]

const ACCOUNT_TYPES = [
  { value: "checking", label: "Cuenta Corriente", icon: Wallet },
  { value: "savings", label: "Cuenta de Ahorros", icon: PiggyBank },
  { value: "credit", label: "Tarjeta de Crédito", icon: CreditCard },
  { value: "investment", label: "Inversiones", icon: TrendingUp },
  { value: "loan", label: "Préstamo", icon: TrendingDown },
]

export function AccountsDashboard({
  accounts = SAMPLE_ACCOUNTS,
  onAddAccount,
  onUpdateAccount,
}: AccountsDashboardProps) {
  const [showBalances, setShowBalances] = useState(true)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    type: "checking",
    currency: "USD",
    isActive: true,
  })

  // Calcular totales
  const totalAssets = accounts
    .filter((acc) => acc.type !== "credit" && acc.type !== "loan")
    .reduce((sum, acc) => sum + acc.balance, 0)

  const totalLiabilities = accounts
    .filter((acc) => acc.type === "credit" || acc.type === "loan")
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0)

  const netWorth = totalAssets - totalLiabilities

  // Agrupar cuentas por tipo
  const accountsByType = accounts.reduce(
    (groups, account) => {
      const type = account.type
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(account)
      return groups
    },
    {} as Record<string, Account[]>,
  )

  // Agregar nueva cuenta
  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.bank || !newAccount.accountNumber) return

    const account: Account = {
      id: Date.now().toString(),
      name: newAccount.name,
      type: newAccount.type as Account["type"],
      balance: Number(newAccount.balance) || 0,
      currency: newAccount.currency || "USD",
      bank: newAccount.bank,
      accountNumber: newAccount.accountNumber,
      isActive: newAccount.isActive ?? true,
      lastUpdated: new Date().toISOString(),
      creditLimit: newAccount.creditLimit ? Number(newAccount.creditLimit) : undefined,
      interestRate: newAccount.interestRate ? Number(newAccount.interestRate) : undefined,
      minimumPayment: newAccount.minimumPayment ? Number(newAccount.minimumPayment) : undefined,
      dueDate: newAccount.dueDate,
    }

    if (onAddAccount) {
      onAddAccount(account)
    }

    setNewAccount({
      type: "checking",
      currency: "USD",
      isActive: true,
    })
    setIsAddAccountOpen(false)
  }

  // Obtener el icono para el tipo de cuenta
  const getAccountIcon = (type: Account["type"]) => {
    const accountType = ACCOUNT_TYPES.find((t) => t.value === type)
    return accountType ? accountType.icon : Wallet
  }

  // Obtener el color para el tipo de cuenta
  const getAccountColor = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return "text-blue-600 bg-blue-50"
      case "savings":
        return "text-green-600 bg-green-50"
      case "credit":
        return "text-red-600 bg-red-50"
      case "investment":
        return "text-purple-600 bg-purple-50"
      case "loan":
        return "text-orange-600 bg-orange-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  // Obtener el estado de la cuenta de crédito
  const getCreditStatus = (account: Account) => {
    if (account.type !== "credit" || !account.creditLimit) return null

    const utilization = (Math.abs(account.balance) / account.creditLimit) * 100

    if (utilization >= 90) return { status: "danger", text: "Límite casi alcanzado" }
    if (utilization >= 70) return { status: "warning", text: "Uso alto" }
    if (utilization >= 30) return { status: "normal", text: "Uso moderado" }
    return { status: "good", text: "Uso bajo" }
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {showBalances ? formatCurrency(totalAssets) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">Cuentas corrientes, ahorros e inversiones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasivos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {showBalances ? formatCurrency(totalLiabilities) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">Tarjetas de crédito y préstamos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimonio Neto</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {showBalances ? formatCurrency(netWorth) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">Activos menos pasivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Mis Cuentas
              </CardTitle>
              <CardDescription>Gestiona todas tus cuentas financieras</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowBalances(!showBalances)}>
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBalances ? "Ocultar" : "Mostrar"}
              </Button>
              <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Cuenta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Cuenta</DialogTitle>
                    <DialogDescription>Conecta una nueva cuenta bancaria o financiera</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre de la Cuenta</Label>
                      <Input
                        id="name"
                        value={newAccount.name || ""}
                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                        placeholder="Ej: Cuenta Corriente Principal"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Tipo de Cuenta</Label>
                        <Select
                          value={newAccount.type}
                          onValueChange={(value) => setNewAccount({ ...newAccount, type: value as Account["type"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bank">Banco</Label>
                        <Input
                          id="bank"
                          value={newAccount.bank || ""}
                          onChange={(e) => setNewAccount({ ...newAccount, bank: e.target.value })}
                          placeholder="Nombre del banco"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountNumber">Número de Cuenta</Label>
                        <Input
                          id="accountNumber"
                          value={newAccount.accountNumber || ""}
                          onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                          placeholder="****1234"
                        />
                      </div>
                      <div>
                        <Label htmlFor="balance">Saldo Inicial</Label>
                        <Input
                          id="balance"
                          type="number"
                          value={newAccount.balance || ""}
                          onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {newAccount.type === "credit" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="creditLimit">Límite de Crédito</Label>
                          <Input
                            id="creditLimit"
                            type="number"
                            value={newAccount.creditLimit || ""}
                            onChange={(e) => setNewAccount({ ...newAccount, creditLimit: Number(e.target.value) })}
                            placeholder="5000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newAccount.dueDate || ""}
                            onChange={(e) => setNewAccount({ ...newAccount, dueDate: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddAccount}>Agregar Cuenta</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Cuentas por Tipo */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="checking">Corrientes</TabsTrigger>
          <TabsTrigger value="savings">Ahorros</TabsTrigger>
          <TabsTrigger value="credit">Crédito</TabsTrigger>
          <TabsTrigger value="investment">Inversiones</TabsTrigger>
          <TabsTrigger value="loan">Préstamos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type)
            const creditStatus = getCreditStatus(account)

            return (
              <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${getAccountColor(account.type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-sm text-gray-500">
                          {account.bank} • {account.accountNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                          {creditStatus && (
                            <Badge
                              variant={
                                creditStatus.status === "danger"
                                  ? "destructive"
                                  : creditStatus.status === "warning"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {creditStatus.text}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {showBalances ? formatCurrency(Math.abs(account.balance)) : "••••••"}
                      </div>
                      <p className="text-sm text-gray-500">
                        Actualizado: {new Date(account.lastUpdated).toLocaleDateString()}
                      </p>
                      {account.type === "credit" && account.creditLimit && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Utilizado</span>
                            <span>{((Math.abs(account.balance) / account.creditLimit) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(Math.abs(account.balance) / account.creditLimit) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {ACCOUNT_TYPES.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            {accountsByType[type.value]?.map((account) => {
              const Icon = type.icon
              const creditStatus = getCreditStatus(account)

              return (
                <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${getAccountColor(account.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.name}</h3>
                          <p className="text-sm text-gray-500">
                            {account.bank} • {account.accountNumber}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={account.isActive ? "default" : "secondary"}>
                              {account.isActive ? "Activa" : "Inactiva"}
                            </Badge>
                            {creditStatus && (
                              <Badge
                                variant={
                                  creditStatus.status === "danger"
                                    ? "destructive"
                                    : creditStatus.status === "warning"
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {creditStatus.text}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {showBalances ? formatCurrency(Math.abs(account.balance)) : "••••••"}
                        </div>
                        <p className="text-sm text-gray-500">
                          Actualizado: {new Date(account.lastUpdated).toLocaleDateString()}
                        </p>
                        {account.type === "credit" && account.creditLimit && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Utilizado</span>
                              <span>{((Math.abs(account.balance) / account.creditLimit) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(Math.abs(account.balance) / account.creditLimit) * 100} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }) || (
              <div className="text-center text-gray-500 py-8">No tienes cuentas de tipo {type.label.toLowerCase()}</div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Alertas y Recordatorios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Alertas y Recordatorios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accounts
              .filter((account) => {
                if (account.type === "credit" && account.dueDate) {
                  const dueDate = new Date(account.dueDate)
                  const today = new Date()
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return daysUntilDue <= 7 && daysUntilDue >= 0
                }
                return false
              })
              .map((account) => {
                const dueDate = new Date(account.dueDate!)
                const today = new Date()
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium">Pago próximo a vencer</p>
                      <p className="text-sm text-gray-600">
                        {account.name} - Vence en {daysUntilDue} día{daysUntilDue !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {account.minimumPayment ? formatCurrency(account.minimumPayment) : "Ver estado"}
                      </p>
                      <p className="text-xs text-gray-500">{dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })}

            {accounts
              .filter((account) => {
                if (account.type === "credit" && account.creditLimit) {
                  const utilization = (Math.abs(account.balance) / account.creditLimit) * 100
                  return utilization >= 80
                }
                return false
              })
              .map((account) => (
                <div
                  key={`${account.id}-limit`}
                  className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium">Límite de crédito alto</p>
                    <p className="text-sm text-gray-600">
                      {account.name} - {((Math.abs(account.balance) / account.creditLimit!) * 100).toFixed(1)}%
                      utilizado
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {formatCurrency(Math.abs(account.balance))} / {formatCurrency(account.creditLimit!)}
                    </p>
                  </div>
                </div>
              ))}

            {accounts.filter((account) => {
              if (account.type === "credit" && account.dueDate) {
                const dueDate = new Date(account.dueDate)
                const today = new Date()
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                return daysUntilDue <= 7 && daysUntilDue >= 0
              }
              if (account.type === "credit" && account.creditLimit) {
                const utilization = (Math.abs(account.balance) / account.creditLimit) * 100
                return utilization >= 80
              }
              return false
            }).length === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Todo está en orden</p>
                  <p className="text-sm text-green-600">No hay alertas pendientes para tus cuentas</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
