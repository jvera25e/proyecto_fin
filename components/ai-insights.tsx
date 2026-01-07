"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Lightbulb,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle,
} from "lucide-react"
import {
  FinancialAI,
  type AIRecommendation,
  type FinancialInsight,
  formatCurrency,
  formatPercentage,
} from "@/lib/ai-recommendations"

interface AIInsightsProps {
  transactions: any[]
}

export function AIInsights({ transactions }: AIInsightsProps) {
  const [insights, setInsights] = useState<FinancialInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null)

  useEffect(() => {
    const generateInsights = async () => {
      setLoading(true)

      // Simular procesamiento de IA
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const ai = new FinancialAI(transactions)
      const generatedInsights = ai.generateInsights()

      setInsights(generatedInsights)
      setLoading(false)
    }

    if (transactions.length > 0) {
      generateInsights()
    }
  }, [transactions])

  const getRecommendationIcon = (type: AIRecommendation["type"]) => {
    switch (type) {
      case "saving":
        return <DollarSign className="w-4 h-4" />
      case "budget":
        return <PieChart className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "opportunity":
        return <Lightbulb className="w-4 h-4" />
      case "goal":
        return <Target className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const getRecommendationColor = (type: AIRecommendation["type"]) => {
    switch (type) {
      case "saving":
        return "bg-green-100 text-green-800 border-green-200"
      case "budget":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "warning":
        return "bg-red-100 text-red-800 border-red-200"
      case "opportunity":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "goal":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getImpactColor = (impact: AIRecommendation["impact"]) => {
    switch (impact) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const translateType = (type: string) => {
    const translations: Record<string, string> = {
      saving: "Ahorro",
      budget: "Presupuesto",
      warning: "Advertencia",
      opportunity: "Oportunidad",
      goal: "Meta",
    }
    return translations[type] || type
  }

  const translateImpact = (impact: string) => {
    const translations: Record<string, string> = {
      high: "Alto impacto",
      medium: "Impacto medio",
      low: "Bajo impacto",
    }
    return translations[impact] || impact
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
            <CardTitle>Analizando tus finanzas...</CardTitle>
          </div>
          <CardDescription>
            Nuestra IA está procesando tus transacciones para generar insights personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No hay suficientes datos para generar insights</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <CardTitle>Análisis Financiero</CardTitle>
          </div>
          <CardDescription>Análisis inteligente de tus patrones financieros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(insights.averageMonthlySpending)}</div>
              <div className="text-sm text-blue-600">Gasto Promedio Mensual</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatPercentage(insights.savingsRate)}</div>
              <div className="text-sm text-green-600">Tasa de Ahorro</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                {insights.spendingTrend === "increasing" && <TrendingUp className="w-5 h-5 text-red-500" />}
                {insights.spendingTrend === "decreasing" && <TrendingDown className="w-5 h-5 text-green-500" />}
                {insights.spendingTrend === "stable" && <div className="w-5 h-5 bg-gray-400 rounded-full" />}
                <span className="text-lg font-semibold capitalize">{insights.spendingTrend}</span>
              </div>
              <div className="text-sm text-gray-600">Tendencia de Gastos</div>
            </div>
          </div>

          {/* Top Categorías */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Principales Categorías de Gasto</h4>
            <div className="space-y-3">
              {insights.topCategories.slice(0, 3).map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(category.averageAmount)} promedio</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPercentage(category.percentage)}</div>
                    <Progress value={category.percentage} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones de IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recomendaciones Personalizadas
          </CardTitle>
          <CardDescription>Sugerencias basadas en tu comportamiento financiero</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRecommendation(recommendation)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getRecommendationColor(recommendation.type)}>
                      {getRecommendationIcon(recommendation.type)}
                      {translateType(recommendation.type)}
                    </Badge>
                    <Badge variant="outline" className={getImpactColor(recommendation.impact)}>
                      {translateImpact(recommendation.impact)}
                    </Badge>
                  </div>
                  {recommendation.potentialSaving && (
                    <div className="text-green-600 font-semibold">
                      +{formatCurrency(recommendation.potentialSaving)}
                    </div>
                  )}
                </div>

                <h4 className="font-semibold mb-1">{recommendation.title}</h4>
                <p className="text-gray-600 text-sm mb-2">{recommendation.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">💡 {recommendation.suggestedAction}</div>
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Recomendación Detallada */}
      {selectedRecommendation && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-auto h-fit bg-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRecommendationIcon(selectedRecommendation.type)}
                <CardTitle>{selectedRecommendation.title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRecommendation(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{selectedRecommendation.description}</p>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Acción Recomendada:</h4>
                <p className="text-blue-700">{selectedRecommendation.suggestedAction}</p>
              </div>

              {selectedRecommendation.potentialSaving && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Ahorro Potencial:</h4>
                  <p className="text-green-700 text-lg font-bold">
                    {formatCurrency(selectedRecommendation.potentialSaving)} mensuales
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Implementar
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Recordar después
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
