import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, ArrowRight, Zap, Shield, Headphones } from "lucide-react"

export default function PricingPage() {
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">Inicio</a>
            </Button>
            <Button size="sm" asChild>
              <a href="/register">Comenzar gratis</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Precios simples y transparentes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sin costos ocultos, sin contratos forzosos. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <PricingCard
              name="Básico"
              price="$499"
              period="mes"
              description="Para negocios que comienzan"
              features={[
                "Hasta 50 clientes",
                "Hasta 100 productos",
                "Cotizaciones ilimitadas",
                "Pedidos ilimitados",
                "Soporte por email",
              ]}
              cta="Comenzar gratis"
              href="/register"
            />
            <PricingCard
              name="Profesional"
              price="$999"
              period="mes"
              description="Para negocios en crecimiento"
              features={[
                "Hasta 200 clientes",
                "Hasta 500 productos",
                "Todo lo de Básico",
                "Reportes básicos",
                "Soporte prioritario",
              ]}
              cta="Comenzar gratis"
              href="/register"
              popular
            />
            <PricingCard
              name="Empresarial"
              price="$1,999"
              period="mes"
              description="Para negocios establecidos"
              features={[
                "Clientes ilimitados",
                "Productos ilimitados",
                "Todo lo de Profesional",
                "Reportes avanzados",
                "Soporte dedicado",
              ]}
              cta="Comenzar gratis"
              href="/register"
            />
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Preguntas frecuentes
            </h2>
            <div className="space-y-6">
              <FAQItem
                question="¿Hay un periodo de prueba?"
                answer="Sí, ofrecemos una prueba gratuita de 30 días. No requerimos tarjeta de crédito y puedes cancelar en cualquier momento."
              />
              <FAQItem
                question="¿Puedo cambiar de plan?"
                answer="Por supuesto. Puedes actualizar o degradar tu plan en cualquier momento desde tu panel de administración."
              />
              <FAQItem
                question="¿Qué métodos de pago aceptan?"
                answer="Aceptamos todas las tarjetas de crédito y débito principales, así como transferencias bancarias a través de Mercado Pago."
              />
              <FAQItem
                question="¿Mis datos están seguros?"
                answer="Absolutamente. Utilizamos encriptación de nivel bancario y cumplimos con todas las normativas de protección de datos en México."
              />
              <FAQItem
                question="¿Ofrecen soporte técnico?"
                answer="Sí, ofrecemos soporte por email en todos los planes. Los planes Profesional y Empresarial incluyen soporte prioritario y dedicado respectivamente."
              />
              <FAQItem
                question="¿Puedo exportar mis datos?"
                answer="Sí, puedes exportar todos tus datos en formato CSV en cualquier momento. Tus datos siempre te pertenecen."
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-muted-foreground mb-6">
              Únete a cientos de PyMEs mexicanas que ya están simplificando 
              su gestión con CotizaNet.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-base px-8">
                Comienza tu prueba gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
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

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  )
}
