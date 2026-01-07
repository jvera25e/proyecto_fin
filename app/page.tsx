import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Zap, Star, CheckCircle, Sparkles, Wallet } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="glass border-b sticky top-0 z-20 backdrop-blur-xl">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-foreground">JEVV</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-foreground hover:text-primary transition-colors font-medium">
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="gradient-primary text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition-all btn-press shadow-lg"
            >
              Comenzar Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border mb-6 animate-slide-in-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Más de 50,000 usuarios confían en nosotros</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-up text-foreground">
            Gestiona tu dinero
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">con inteligencia</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-in-up">
            La plataforma financiera más completa para controlar tus ingresos, gastos y alcanzar tus metas con seguridad
            biométrica y análisis avanzado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-in-up">
            <Link
              href="/register"
              className="gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all btn-press shadow-lg flex items-center justify-center gap-2 group"
            >
              Comenzar ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="glass border px-8 py-4 rounded-xl font-semibold hover:border-primary/50 transition-all btn-press text-foreground"
            >
              Ver Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="glass p-6 rounded-2xl border card-hover">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Usuarios activos</div>
            </div>
            <div className="glass p-6 rounded-2xl border card-hover">
              <div className="text-4xl font-bold text-primary mb-2">$2M+</div>
              <div className="text-muted-foreground">Capital gestionado</div>
            </div>
            <div className="glass p-6 rounded-2xl border card-hover">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-4xl font-bold text-primary">4.9</span>
                <Star className="w-8 h-8 text-primary fill-current" />
              </div>
              <div className="text-muted-foreground">Valoración media</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">¿Por qué JEVV?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades diseñadas para simplificar tu vida financiera
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="glass rounded-2xl p-8 border card-hover">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Análisis en Tiempo Real</h3>
              <p className="text-muted-foreground mb-6">
                IA avanzada que analiza tus patrones de gasto y te ayuda a optimizar tus finanzas automáticamente.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Categorización automática de gastos
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Predicciones inteligentes de flujo
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Alertas personalizadas proactivas
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-8 border card-hover">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Seguridad Máxima</h3>
              <p className="text-muted-foreground mb-6">
                Protección de nivel bancario con autenticación biométrica para mantener tus datos completamente seguros.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Encriptación SSL de 256 bits
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Reconocimiento facial avanzado
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Certificación SOC 2 Type II
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-8 border card-hover">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Reportes Avanzados</h3>
              <p className="text-muted-foreground mb-6">
                Visualizaciones detalladas y reportes exportables en PDF para un seguimiento completo de tu situación.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Gráficos interactivos personalizables
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Exportación a PDF con un clic
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  Análisis comparativo mensual
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="glass rounded-3xl p-12 border text-center max-w-4xl mx-auto card-hover">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Comienza tu transformación
              <br />
              financiera hoy
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a miles de personas que ya mejoraron su salud financiera con JEVV
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all btn-press shadow-lg group"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-muted-foreground mt-4">Sin tarjeta de crédito • 14 días de prueba gratis</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass border-t mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-foreground">JEVV</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2026 JEVV. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
