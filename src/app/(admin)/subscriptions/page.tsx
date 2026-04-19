import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Search,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from "lucide-react"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getSubscriptions() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      plan: true,
      company: true,
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return subscriptions
}

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getSubscriptions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-900">Suscripciones</h1>
        <p className="text-primary-500 mt-1">
          Gestiona las suscripciones del SaaS
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por empresa o plan..."
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white text-sm text-primary-900 focus-visible:outline-none focus-visible:border-danger-600">
              <option value="">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="grace_period">Período de gracia</option>
              <option value="suspended">Suspendidas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay suscripciones</h3>
            <p className="text-primary-500 text-center max-w-md">
              Las suscripciones aparecerán aquí cuando las empresas se registren.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription: any) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubscriptionCard({ subscription }: { subscription: any }) {
  const now = new Date()
  const nextBilling = new Date(subscription.nextBillingAt)
  const graceUntil = subscription.graceUntil ? new Date(subscription.graceUntil) : null
  const daysUntilBilling = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const graceDaysRemaining = graceUntil ? Math.ceil((graceUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Company & Plan */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 bg-danger-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-danger-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-primary-900">{subscription.company.name}</h3>
                  <SubscriptionStatusBadge status={subscription.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-500">
                  <CreditCard className="h-4 w-4" />
                  <span>{subscription.plan.name}</span>
                  <span className="text-primary-400">•</span>
                  <span>${subscription.plan.priceMxn.toLocaleString('es-MX')} MXN/mes</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-primary-200">
              <div>
                <p className="text-xs text-primary-500 mb-1">Período actual</p>
                <p className="text-sm font-medium text-primary-900">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString('es-MX')} - {' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-500 mb-1">Próximo cobro</p>
                <p className="text-sm font-medium text-primary-900">
                  {new Date(subscription.nextBillingAt).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Status & Actions */}
          <div className="lg:w-80 space-y-4">
            {/* Status Card */}
            <Card className="bg-primary-50">
              <CardContent className="p-4 space-y-3">
                {subscription.status === 'active' && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-success-900">Activa</p>
                      <p className="text-xs text-success-700">
                        Próximo cobro en {daysUntilBilling} días
                      </p>
                    </div>
                  </div>
                )}

                {subscription.status === 'grace_period' && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warning-900">Período de gracia</p>
                      <p className="text-xs text-warning-700">
                        {graceDaysRemaining} días restantes
                      </p>
                    </div>
                  </div>
                )}

                {subscription.status === 'suspended' && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="h-4 w-4 text-danger-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-danger-900">Suspendida</p>
                      <p className="text-xs text-danger-700">
                        Requiere pago para reactivar
                      </p>
                    </div>
                  </div>
                )}

                {subscription.status === 'cancelled' && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-900">Cancelada</p>
                      <p className="text-xs text-primary-600">
                        Suscripción terminada
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Invoice */}
            {subscription.invoices.length > 0 && (
              <Card className="bg-primary-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-primary-500">Última factura</p>
                    <Badge variant={subscription.invoices[0].status === 'paid' ? 'success' : 'warning'}>
                      {subscription.invoices[0].status === 'paid' ? 'Pagada' : 'Pendiente'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-900">
                        {subscription.invoices[0].concept}
                      </p>
                      <p className="text-xs text-primary-500">
                        {new Date(subscription.invoices[0].createdAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-900">
                        ${subscription.invoices[0].amountMxn.toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Activa', variant: 'success' as const },
    grace_period: { label: 'Gracia', variant: 'warning' as const },
    suspended: { label: 'Suspendida', variant: 'destructive' as const },
    cancelled: { label: 'Cancelada', variant: 'secondary' as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
