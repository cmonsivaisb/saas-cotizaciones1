import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, Package, Receipt, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  { title: "Cliente", description: "Elige o registra a quien vas a vender.", icon: CheckCircle2 },
  { title: "Cotizacion", description: "Agrega productos, cantidades, precio y vigencia.", icon: FileText },
  { title: "Enviar", description: "Guarda como borrador o marca como enviada.", icon: Send },
  { title: "Pedido", description: "Cuando el cliente apruebe, conviertela en pedido.", icon: Package },
  { title: "Cobranza", description: "Registra pagos y revisa saldos pendientes.", icon: Receipt },
]

export function QuoteLifecycleGuide({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="border-action-200 bg-action-50/40">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Flujo recomendado</CardTitle>
            <CardDescription>
              Sigue estos pasos para pasar de una cotizacion a pedido y cobranza sin perder informacion.
            </CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href="/help">
              Ver guia completa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={compact ? "grid grid-cols-1 gap-3 md:grid-cols-5" : "grid grid-cols-1 gap-4 md:grid-cols-5"}>
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-lg border border-action-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-action-100 text-action-700">
                  <step.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-action-700">Paso {index + 1}</span>
              </div>
              <p className="font-semibold text-primary-900">{step.title}</p>
              <p className="mt-1 text-sm text-primary-500">{step.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
