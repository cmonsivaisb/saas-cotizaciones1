import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Package, 
  DollarSign, 
  Users, 
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  Receipt,
  Wallet,
  CreditCard,
  Building2
} from "lucide-react"

export default async function HomePage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  // Redirect to dashboard if user is logged in
  if (session) {
    redirect('/dashboard')
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CotizaNet</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Características
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              Cómo funciona
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Precios
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Comenzar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        {/* Decorative background graphics */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-20 right-10 w-64 h-64 text-blue-200/50" viewBox="0 0 200 200" fill="currentColor">
            <rect x="40" y="30" width="120" height="140" rx="8" fill="currentColor" className="opacity-20"/>
            <rect x="55" y="50" width="90" height="8" rx="2" fill="currentColor" className="opacity-40"/>
            <rect x="55" y="65" width="70" height="6" rx="2" fill="currentColor" className="opacity-30"/>
            <rect x="55" y="78" width="80" height="6" rx="2" fill="currentColor" className="opacity-30"/>
            <rect x="55" y="95" width="90" height="30" rx="4" fill="currentColor" className="opacity-25"/>
            <rect x="55" y="135" width="60" height="6" rx="2" fill="currentColor" className="opacity-30"/>
          </svg>
          <svg className="absolute bottom-20 left-10 w-48 h-48 text-green-400/40" viewBox="0 0 150 150" fill="currentColor">
            <circle cx="75" cy="75" r="50" fill="currentColor" className="opacity-15"/>
            <circle cx="75" cy="75" r="35" fill="currentColor" className="opacity-20"/>
            <path d="M55 75 L65 85 L85 60" stroke="currentColor" strokeWidth="6" fill="none" className="opacity-60"/>
          </svg>
          <svg className="absolute top-1/3 left-1/4 w-32 h-32 text-yellow-400/40" viewBox="0 0 100 100" fill="currentColor">
            <rect x="15" y="20" width="70" height="60" rx="4" fill="currentColor" className="opacity-15"/>
            <circle cx="50" cy="45" r="12" fill="currentColor" className="opacity-25"/>
            <path d="M30 70 L45 60 L60 70" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-40"/>
          </svg>
        </div>
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Cotizaciones, pedidos y cobranza para PyMEs
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Simplifica la gestión de tu negocio con un sistema diseñado para talleres, 
            distribuidores, maquinados y servicios técnicos en México.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8">
                Prueba gratis por 15 días
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-base px-8">
                Solicitar demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Sin tarjeta de crédito requerida • Configura en minutos
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-muted/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 text-primary-200/20 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <rect x="20" y="10" width="60" height="80" rx="4" fill="currentColor" className="opacity-20"/>
            <rect x="30" y="25" width="40" height="4" rx="2" fill="currentColor" className="opacity-40"/>
            <rect x="30" y="35" width="30" height="3" rx="1" fill="currentColor" className="opacity-30"/>
            <rect x="30" y="45" width="35" height="3" rx="1" fill="currentColor" className="opacity-30"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 text-primary-300/15 pointer-events-none">
          <svg viewBox="0 0 80 80" fill="currentColor">
            <circle cx="40" cy="40" r="30" fill="currentColor" className="opacity-15"/>
            <path d="M25 40 L35 50 L55 30" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-50"/>
          </svg>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Te suena familiar?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Pérdida de tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Horas perdidas en cotizaciones manuales, seguimiento por WhatsApp 
                  y cálculos repetitivos que podrías automatizar.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Desorden en pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pedidos en notas, hojas de cálculo dispersas y sin seguimiento 
                  claro del estado de cada entrega.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Cobranza complicada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Dificultad para saber quién debe qué, pagos parciales sin registro 
                  y saldos que se pierden en el camino.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative overflow-hidden">
        {/* Decorative floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 text-blue-300/30 rotate-12 pointer-events-none">
          <svg viewBox="0 0 80 80" fill="currentColor">
            <rect x="10" y="15" width="60" height="50" rx="4" fill="currentColor" className="opacity-15"/>
            <rect x="18" y="22" width="44" height="4" rx="2" fill="currentColor" className="opacity-30"/>
            <rect x="18" y="30" width="30" height="3" rx="1" fill="currentColor" className="opacity-25"/>
            <circle cx="40" cy="50" r="8" fill="currentColor" className="opacity-20"/>
          </svg>
        </div>
        <div className="absolute bottom-24 right-16 w-28 h-28 text-green-400/25 -rotate-6 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M20 80 L35 55 L50 70 L65 45 L80 65" stroke="currentColor" strokeWidth="6" fill="none" className="opacity-30"/>
            <circle cx="20" cy="80" r="5" fill="currentColor" className="opacity-40"/>
            <circle cx="35" cy="55" r="5" fill="currentColor" className="opacity-40"/>
            <circle cx="50" cy="70" r="5" fill="currentColor" className="opacity-40"/>
            <circle cx="65" cy="45" r="5" fill="currentColor" className="opacity-40"/>
            <circle cx="80" cy="65" r="5" fill="currentColor" className="opacity-40"/>
          </svg>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <h2 className="text-3xl font-bold text-center mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Un sistema completo diseñado para la realidad de las PyMEs mexicanas
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Cotizaciones profesionales"
              description="Crea cotizaciones en minutos con plantillas, envía por email y convierte en pedidos con un clic."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Gestión de clientes"
              description="Mantén un registro completo de tus clientes, historial de compras y seguimiento de oportunidades."
            />
            <FeatureCard
              icon={<Package className="h-6 w-6" />}
              title="Inventario básico"
              description="Controla tu stock, recibe alertas de bajo inventario y registra movimientos de entrada y salida."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Seguimiento de pedidos"
              description="Visualiza el estado de cada pedido, desde pendiente hasta entregado, con fechas de compromiso."
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6" />}
              title="Cobranza simplificada"
              description="Registra pagos, calcula saldos automáticamente y mantén al día tu cartera de clientes."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Seguridad y respaldo"
              description="Tus datos seguros en la nube, accesibles desde cualquier lugar y siempre respaldados."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/50 relative overflow-hidden">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-32 h-32 text-primary-300/10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" fill="currentColor" className="opacity-10"/>
            <rect x="30" y="30" width="40" height="40" rx="4" fill="currentColor" className="opacity-15"/>
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-40 h-40 text-primary-300/10 pointer-events-none">
          <svg viewBox="0 0 120 120" fill="currentColor">
            <path d="M20 100 L40 60 L60 80 L80 40 L100 60" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"/>
          </svg>
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">
            Cómo funciona
          </h2>
          <div className="space-y-8">
            <StepCard
              number={1}
              title="Regístrate en minutos"
              description="Crea tu cuenta sin tarjeta de crédito. Configura tu empresa y comienza a usar el sistema de inmediato."
            />
            <StepCard
              number={2}
              title="Carga tus datos"
              description="Agrega tus clientes, productos o servicios. Importa desde Excel o crea manualmente."
            />
            <StepCard
              number={3}
              title="Comienza a cotizar"
              description="Crea cotizaciones profesionales, envíalas por email y convierte en pedidos cuando se aprueben."
            />
            <StepCard
              number={4}
              title="Gestiona y crece"
              description="Controla pedidos, inventario y cobranza desde un solo lugar. Toma mejores decisiones."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 w-36 h-36 text-blue-300/25 -z-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 90 Q30 50 50 30 T90 10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-30"/>
            <circle cx="50" cy="30" r="4" fill="currentColor" className="opacity-40"/>
            <circle cx="70" cy="50" r="4" fill="currentColor" className="opacity-40"/>
            <circle cx="90" cy="90" r="4" fill="currentColor" className="opacity-40"/>
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 w-40 h-40 text-green-400/25 pointer-events-none">
          <svg viewBox="0 0 120 120" fill="currentColor">
            <rect x="20" y="20" width="80" height="80" rx="8" fill="currentColor" className="opacity-10"/>
            <path d="M40 70 L55 85 L80 55" stroke="currentColor" strokeWidth="6" fill="none" className="opacity-50"/>
          </svg>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir CotizaNet?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <BenefitItem
              icon={<Zap className="h-5 w-5" />}
              title="Fácil de usar"
              description="Interfaz intuitiva, sin necesidad de conocimientos técnicos. Tu equipo lo aprenderá en minutos."
            />
            <BenefitItem
              icon={<Shield className="h-5 w-5" />}
              title="Seguro y confiable"
              description="Datos encriptados, respaldos automáticos y cumplimiento con normativas de protección de datos."
            />
            <BenefitItem
              icon={<Clock className="h-5 w-5" />}
              title="Ahorra tiempo"
              description="Automatiza tareas repetitivas y enfócate en lo que realmente importa: tu negocio."
            />
            <BenefitItem
              icon={<BarChart3 className="h-5 w-5" />}
              title="Diseñado para México"
              description="Moneda en pesos, formatos locales, soporte en español y entendimiento del mercado local."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Precios simples y transparentes
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Sin costos ocultos, sin contratos forzosos. Cancela cuando quieras.
          </p>
          <div className="max-w-md mx-auto">
            <PricingCard
              name="CotizaNet"
              price="$500"
              period="mes"
              description="Todo lo que necesitas para tu negocio"
              features={[
                "Clientes ilimitados",
                "Productos ilimitados",
                "Cotizaciones ilimitadas",
                "Pedidos ilimitados",
                "Reportes completos",
                "Soporte prioritario",
              ]}
              cta="Comenzar gratis"
              href="/register"
              popular
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a cientos de PyMEs mexicanas que ya están simplificando 
            su gestión con CotizaNet.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base px-8">
              Comienza tu prueba gratuita de 15 días
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Sin compromiso • Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">CotizaNet</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cotizaciones, pedidos y cobranza para PyMEs mexicanas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="text-muted-foreground hover:text-primary">Características</Link></li>
                <li><Link href="#pricing" className="text-muted-foreground hover:text-primary">Precios</Link></li>
                <li><Link href="/demo" className="text-muted-foreground hover:text-primary">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contacto</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Términos</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacidad</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Términos</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 CotizaNet. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-primary mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 text-primary mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  cta, 
  href, 
  popular = false 
}: { 
  name: string, 
  price: string, 
  period: string, 
  description: string, 
  features: string[], 
  cta: string, 
  href: string,
  popular?: boolean 
}) {
  return (
    <Card className={popular ? "border-primary shadow-lg" : ""}>
      {popular && (
        <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-t-lg text-center">
          Más popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Link href={href} className="block">
          <Button className="w-full" variant={popular ? "default" : "outline"}>
            {cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
