export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrency(value: string): number {
  // Remover símbolos de moneda y espacios
  const cleanValue = value.replace(/[$,\s]/g, "")
  return Number.parseFloat(cleanValue) || 0
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
