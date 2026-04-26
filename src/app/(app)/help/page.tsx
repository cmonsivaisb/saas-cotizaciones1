import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, HelpCircle, Package, Receipt, Settings, Users, Warehouse } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuoteLifecycleGuide } from "@/components/quote-lifecycle-guide"

const guides = [
  {
    title: "1. Configura tu negocio",
    description: "Revisa tus datos de empresa para que las cotizaciones y documentos salgan correctos.",
    href: "/settings",
    icon: Settings,
    actions: ["Completa nombre comercial", "Revisa correo y telefono", "Guarda cambios antes de cotizar"],
  },
  {
    title: "2. Registra clientes",
    description: "Crea clientes una sola vez para reutilizarlos en cotizaciones y pedidos.",
    href: "/clients/new",
    icon: Users,
    actions: ["Captura razon social o nombre", "Agrega telefono/correo", "Usa notas para datos importantes"],
  },
  {
    title: "3. Agrega productos o servicios",
    description: "Carga lo que vendes con precio base para armar cotizaciones mas rapido.",
    href: "/inventory/new",
    icon: Warehouse,
    actions: ["Nombre claro del producto", "Precio de venta", "Stock minimo si manejas inventario"],
  },
  {
    title: "4. Crea una cotizacion",
    description: "Selecciona cliente, agrega productos, ajusta cantidades y guarda.",
    href: "/quotes/new",
    icon: FileText,
    actions: ["Elige cliente", "Agrega partidas", "Revisa total y vigencia"],
  },
  {
    title: "5. Convierte a pedido",
    description: "Cuando el cliente aprueba, crea el pedido desde la cotizacion para no recapturar.",
    href: "/quotes",
    icon: Package,
    actions: ["Abre la cotizacion", "Usa convertir a pedido", "Confirma entrega y notas"],
  },
  {
    title: "6. Da seguimiento a cobranza",
    description: "Revisa pagos pendientes y reportes para saber que se debe cobrar primero.",
    href: "/reports",
    icon: Receipt,
    actions: ["Revisa por cobrar", "Consulta clientes principales", "Atiende inventario critico"],
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border-2 border-action-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-action-50 px-3 py-1 text-sm font-semibold text-action-700">
              <HelpCircle className="h-4 w-4" />
              Centro de ayuda
            </div>
            <h1 className="text-3xl font-bold text-primary-900">Guias simples para operar el ciclo completo</h1>
            <p className="mt-2 max-w-2xl text-primary-500">
              Esta seccion esta pensada para personas que no usan sistemas todos los dias: pasos cortos, lenguaje claro y accesos directos.
            </p>
          </div>
          <Button asChild>
            <Link href="/quotes/new">
              Crear cotizacion
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <QuoteLifecycleGuide compact />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {guides.map((guide) => (
          <Card key={guide.title}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-action-100 text-action-700">
                  <guide.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="mb-5 space-y-2">
                {guide.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm text-primary-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-600" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline">
                <Link href={guide.href}>
                  Ir a este paso
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
