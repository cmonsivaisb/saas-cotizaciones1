import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Search, 
  Calendar,
  Building2,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink
} from "lucide-react"

async function getPayments() {
  const paymentAttempts = await prisma.paymentAttempt.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invoice: {
        include: {
          company: true,
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  })

  return paymentAttempts
}

export default async function AdminPaymentsPage() {
  const payments = await getPayments()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-900">Pagos</h1>
        <p className="text-primary-500 mt-1">
          Historial de intentos de pago
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por empresa o factura..."
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white text-sm text-primary-900 focus-visible:outline-none focus-visible:border-danger-600">
              <option value="">Todos los estados</option>
              <option value="created">Creados</option>
              <option value="redirected">Redirigidos</option>
              <option value="approved">Aprobados</option>
              <option value="pending">Pendientes</option>
              <option value="rejected">Rechazados</option>
              <option value="cancelled">Cancelados</option>
              <option value="error">Error</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <DollarSign className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay pagos</h3>
            <p className="text-primary-500 text-center max-w-md">
              Los intentos de pago aparecerán aquí cuando se generen facturas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment: any) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentCard({ payment }: { payment: any }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Payment Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 bg-danger-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-danger-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-primary-900">
                    {payment.invoice.company.name}
                  </h3>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-500">
                  <Building2 className="h-4 w-4" />
                  <span>{payment.invoice.subscription.plan.name}</span>
                  <span className="text-primary-400">•</span>
                  <span>${payment.invoice.amountMxn.toLocaleString('es-MX')} MXN</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-primary-200">
              <div>
                <p className="text-xs text-primary-500 mb-1">Fecha</p>
                <p className="text-sm font-medium text-primary-900">
                  {new Date(payment.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-500 mb-1">ID de preferencia</p>
                <p className="text-sm font-mono text-primary-900">
                  {payment.providerPreferenceId}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Amount & Actions */}
          <div className="lg:w-80 space-y-4">
            {/* Amount Card */}
            <Card className="bg-primary-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-primary-500">Monto</p>
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary-900">
                    <DollarSign className="h-5 w-5" />
                    {payment.invoice.amountMxn.toLocaleString('es-MX')}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-primary-500">
                  <span>Proveedor</span>
                  <span className="font-medium text-primary-900 capitalize">
                    {payment.provider}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {payment.checkoutUrl && (
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <a href={payment.checkoutUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Ver en Mercado Pago
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    created: { label: 'Creado', variant: 'secondary' as const },
    redirected: { label: 'Redirigido', variant: 'info' as const },
    approved: { label: 'Aprobado', variant: 'success' as const },
    pending: { label: 'Pendiente', variant: 'warning' as const },
    rejected: { label: 'Rechazado', variant: 'destructive' as const },
    cancelled: { label: 'Cancelado', variant: 'secondary' as const },
    error: { label: 'Error', variant: 'destructive' as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
