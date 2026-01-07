"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
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
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Plus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

interface FinancialEvent {
  id: string
  title: string
  description: string
  amount: number
  type: "income" | "expense" | "reminder" | "goal"
  date: string
  category: string
  recurring?: "none" | "daily" | "weekly" | "monthly" | "yearly"
  status: "pending" | "completed" | "overdue"
}

interface FinancialCalendarProps {
  transactions?: Transaction[]
  onAddTransaction?: (transaction: Omit<Transaction, "id">) => void
}

const CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Entretenimiento",
  "Servicios",
  "Salud",
  "Educación",
  "Compras",
  "Otros",
]

const SAMPLE_EVENTS: FinancialEvent[] = [
  {
    id: "1",
    title: "Pago de Renta",
    description: "Pago mensual de alquiler",
    amount: 1200,
    type: "expense",
    date: "2024-01-15",
    category: "Servicios",
    recurring: "monthly",
    status: "pending",
  },
  {
    id: "2",
    title: "Salario",
    description: "Pago de nómina",
    amount: 4500,
    type: "income",
    date: "2024-01-30",
    category: "Salario",
    recurring: "monthly",
    status: "completed",
  },
  {
    id: "3",
    title: "Meta de Ahorro",
    description: "Ahorrar para vacaciones",
    amount: 500,
    type: "goal",
    date: "2024-01-31",
    category: "Ahorros",
    recurring: "monthly",
    status: "pending",
  },
]

export function FinancialCalendar({ transactions = [], onAddTransaction }: FinancialCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<FinancialEvent[]>(SAMPLE_EVENTS)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<FinancialEvent>>({
    type: "expense",
    recurring: "none",
    status: "pending",
  })

  // Obtener eventos para una fecha específica
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString)
  }

  // Obtener transacciones para una fecha específica
  const getTransactionsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return transactions.filter((transaction) => transaction.date === dateString)
  }

  // Calcular el balance diario
  const getDailyBalance = (date: Date) => {
    const dayTransactions = getTransactionsForDate(date)
    const dayEvents = getEventsForDate(date).filter((e) => e.type !== "reminder" && e.type !== "goal")

    const transactionBalance = dayTransactions.reduce((sum, t) => {
      return sum + (t.type === "income" ? t.amount : -Math.abs(t.amount))
    }, 0)

    const eventBalance = dayEvents.reduce((sum, e) => {
      return sum + (e.type === "income" ? e.amount : -Math.abs(e.amount))
    }, 0)

    return transactionBalance + eventBalance
  }

  // Agregar nuevo evento
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.amount || !selectedDate) return

    const event: FinancialEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description || "",
      amount: Number(newEvent.amount),
      type: newEvent.type as "income" | "expense" | "reminder" | "goal",
      date: selectedDate.toISOString().split("T")[0],
      category: newEvent.category || "Otros",
      recurring: newEvent.recurring || "none",
      status: newEvent.status || "pending",
    }

    setEvents([...events, event])
    setNewEvent({
      type: "expense",
      recurring: "none",
      status: "pending",
    })
    setIsAddEventOpen(false)

    // Si es una transacción, también agregarla a las transacciones
    if ((event.type === "income" || event.type === "expense") && onAddTransaction) {
      onAddTransaction({
        description: event.title,
        amount: event.type === "income" ? event.amount : -Math.abs(event.amount),
        category: event.category,
        date: event.date,
        type: event.type,
      })
    }
  }

  // Marcar evento como completado
  const toggleEventStatus = (eventId: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? { ...event, status: event.status === "completed" ? "pending" : "completed" } : event,
      ),
    )
  }

  // Obtener el color del día basado en el balance
  const getDayColor = (date: Date) => {
    const balance = getDailyBalance(date)
    const hasEvents = getEventsForDate(date).length > 0
    const hasTransactions = getTransactionsForDate(date).length > 0

    if (!hasEvents && !hasTransactions) return ""

    if (balance > 0) return "bg-green-100 text-green-800"
    if (balance < 0) return "bg-red-100 text-red-800"
    return "bg-blue-100 text-blue-800"
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []
  const selectedDateTransactions = selectedDate ? getTransactionsForDate(selectedDate) : []
  const selectedDateBalance = selectedDate ? getDailyBalance(selectedDate) : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Calendario Financiero
              </CardTitle>
              <CardDescription>Planifica y visualiza tus finanzas por fecha</CardDescription>
            </div>
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Evento Financiero</DialogTitle>
                  <DialogDescription>Crea un recordatorio, meta o transacción programada</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newEvent.title || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Ej: Pago de renta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Descripción opcional"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Ingreso</SelectItem>
                          <SelectItem value="expense">Gasto</SelectItem>
                          <SelectItem value="reminder">Recordatorio</SelectItem>
                          <SelectItem value="goal">Meta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Monto</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newEvent.amount || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, amount: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={newEvent.category}
                        onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="recurring">Recurrencia</Label>
                      <Select
                        value={newEvent.recurring}
                        onValueChange={(value) => setNewEvent({ ...newEvent, recurring: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No recurrente</SelectItem>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddEvent}>Agregar Evento</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario */}
            <div className="lg:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasActivity: (date) => getEventsForDate(date).length > 0 || getTransactionsForDate(date).length > 0,
                }}
                modifiersStyles={{
                  hasActivity: {
                    fontWeight: "bold",
                  },
                }}
                components={{
                  Day: ({ date, ...props }) => {
                    const dayColor = getDayColor(date)
                    return (
                      <div className={`${dayColor} rounded-md p-1`} {...props}>
                        {date.getDate()}
                      </div>
                    )
                  },
                }}
              />
            </div>

            {/* Panel de detalles del día seleccionado */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Selecciona una fecha"}
                  </CardTitle>
                  {selectedDate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span
                        className={`font-semibold ${
                          selectedDateBalance > 0
                            ? "text-green-600"
                            : selectedDateBalance < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        Balance: {formatCurrency(selectedDateBalance)}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Eventos del día */}
                  {selectedDateEvents.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Eventos Programados</h4>
                      <div className="space-y-2">
                        {selectedDateEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex items-center gap-2">
                              {event.type === "income" && <TrendingUp className="w-4 h-4 text-green-500" />}
                              {event.type === "expense" && <TrendingDown className="w-4 h-4 text-red-500" />}
                              {event.type === "reminder" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                              {event.type === "goal" && <DollarSign className="w-4 h-4 text-blue-500" />}
                              <div>
                                <p className="font-medium text-sm">{event.title}</p>
                                <p className="text-xs text-gray-500">{event.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {event.type !== "reminder" && (
                                <p
                                  className={`font-semibold text-sm ${
                                    event.type === "income" ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {formatCurrency(event.amount)}
                                </p>
                              )}
                              <Badge
                                variant={event.status === "completed" ? "default" : "secondary"}
                                className="text-xs cursor-pointer"
                                onClick={() => toggleEventStatus(event.id)}
                              >
                                {event.status === "completed" ? "Completado" : "Pendiente"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transacciones del día */}
                  {selectedDateTransactions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Transacciones</h4>
                      <div className="space-y-2">
                        {selectedDateTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex items-center gap-2">
                              {transaction.type === "income" ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{transaction.description}</p>
                                <p className="text-xs text-gray-500">{transaction.category}</p>
                              </div>
                            </div>
                            <p
                              className={`font-semibold text-sm ${
                                transaction.type === "income" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(Math.abs(transaction.amount))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDateEvents.length === 0 && selectedDateTransactions.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No hay eventos o transacciones para esta fecha</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de eventos próximos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Eventos y recordatorios de los próximos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events
              .filter((event) => {
                const eventDate = new Date(event.date)
                const today = new Date()
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                return eventDate >= today && eventDate <= nextWeek && event.status === "pending"
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {event.type === "income" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {event.type === "expense" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {event.type === "reminder" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    {event.type === "goal" && <DollarSign className="w-4 h-4 text-blue-500" />}
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString("es-ES")} • {event.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.type !== "reminder" && (
                      <p className={`font-semibold ${event.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(event.amount)}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {event.recurring !== "none" ? `Recurrente (${event.recurring})` : "Una vez"}
                    </Badge>
                  </div>
                </div>
              ))}
            {events.filter((event) => {
              const eventDate = new Date(event.date)
              const today = new Date()
              const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
              return eventDate >= today && eventDate <= nextWeek && event.status === "pending"
            }).length === 0 && <div className="text-center text-gray-500 py-4">No hay eventos próximos</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
