import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Search,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Download
} from "lucide-react"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getInvoices() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      company: true,
      subscription: {
        include: {
          plan: true,
        },
      },
      paymentAttempts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return invoices
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-900">Facturas</h1>
        <p className="text-primary-500 mt-1">
          Gestiona las facturas del SaaS
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por empresa o concepto..."
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white text-sm text-primary-900 focus-visible:outline-none focus-visible:border-danger-600">
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="paid">Pagadas</option>
              <option value="expired">Expiradas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay facturas</h3>
            <p className="text-primary-500 text-center max-w-md">
              Las facturas aparecerán aquí cuando se generen los ciclos de facturación.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice: any) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  )
}

function InvoiceCard({ invoice }: { invoice: any }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Invoice Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 bg-danger-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-danger-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-primary-900">{invoice.concept}</h3>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-500">
                  <Building2 className="h-4 w-4" />
                  <span>{invoice.company.name}</span>
                  <span className="text-primary-400">•</span>
                  <span>{invoice.subscription.plan.name}</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-primary-200">
              <div>
                <p className="text-xs text-primary-500 mb-1">Creada</p>
                <p className="text-sm font-medium text-primary-900">
                  {new Date(invoice.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-500 mb-1">Vencimiento</p>
                <p className="text-sm font-medium text-primary-900">
                  {new Date(invoice.dueAt).toLocaleDateString('es-MX')}
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
                    {invoice.amountMxn.toLocaleString('es-MX')}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-primary-500">
                  <span>Moneda</span>
                  <span className="font-medium text-primary-900">{invoice.currency}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            {invoice.paymentAttempts.length > 0 && (
              <Card className="bg-primary-50">
                <CardContent className="p-4">
                  <p className="text-xs text-primary-500 mb-2">Último intento de pago</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-900">
                        {new Date(invoice.paymentAttempts[0].createdAt).toLocaleDateString('es-MX')}
                      </p>
                      <PaymentStatusBadge status={invoice.paymentAttempts[0].status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {invoice.status === 'paid' && (
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: 'Pendiente', variant: 'warning' as const },
    paid: { label: 'Pagada', variant: 'success' as const },
    expired: { label: 'Expirada', variant: 'destructive' as const },
    cancelled: { label: 'Cancelada', variant: 'secondary' as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
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
