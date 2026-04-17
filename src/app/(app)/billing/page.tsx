import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  ArrowRight,
  Download,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

async function getBillingData() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    // Get company with subscription and plan
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: {
          include: {
            plan: true,
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    })

    if (!company) {
      redirect('/login')
    }

    // Calculate billing status
    const subscription = company.subscription
    let billingStatus = 'active'
    let daysUntilDue = 0
    let graceDaysRemaining = 0

    if (subscription) {
      const now = new Date()
      const nextBilling = new Date(subscription.nextBillingAt)
      const graceUntil = subscription.graceUntil ? new Date(subscription.graceUntil) : null

      if (subscription.status === 'suspended') {
        billingStatus = 'suspended'
      } else if (subscription.status === 'grace_period' && graceUntil) {
        billingStatus = 'grace_period'
        graceDaysRemaining = Math.ceil((graceUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      } else if (nextBilling < now) {
        billingStatus = 'overdue'
        daysUntilDue = Math.ceil((now.getTime() - nextBilling.getTime()) / (1000 * 60 * 60 * 24))
      } else {
        daysUntilDue = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    return {
      company: {
        id: company.id,
        name: company.name,
        status: company.status,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextBillingAt: subscription.nextBillingAt,
        graceUntil: subscription.graceUntil,
        suspendedAt: subscription.suspendedAt,
      } : null,
      invoices: subscription?.invoices || [],
      billingStatus,
      daysUntilDue,
      graceDaysRemaining,
    }
  } catch (error) {
    console.error('Error fetching billing data:', error)
    redirect('/login')
  }
}

export default async function BillingPage() {
  const data = await getBillingData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-900">Facturación</h1>
        <p className="text-primary-500 mt-1">
          Gestiona tu suscripción y pagos
        </p>
      </div>

      {/* Grace Period Banner */}
      {data.billingStatus === 'grace_period' && (
        <Card className="border-warning-200 bg-warning-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning-900 mb-1">
                  Período de gracia activo
                </h3>
                <p className="text-sm text-warning-700">
                  Tienes {data.graceDaysRemaining} días restantes para pagar tu factura. 
                  Después de este período, tu cuenta será suspendida.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspended Banner */}
      {data.billingStatus === 'suspended' && (
        <Card className="border-danger-200 bg-danger-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-danger-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-danger-900 mb-1">
                  Cuenta suspendida
                </h3>
                <p className="text-sm text-danger-700">
                  Tu cuenta ha sido suspendida por falta de pago. 
                  Paga tu factura pendiente para reactivar tu cuenta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Info */}
      {data.subscription && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary-900">
                  {data.subscription.plan.name}
                </h3>
                <p className="text-3xl font-bold text-action-600 mt-2">
                  ${data.subscription.plan.priceMxn.toLocaleString('es-MX')} MXN
                  <span className="text-base font-normal text-primary-500">/mes</span>
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t-2 border-primary-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-500">Estado</span>
                  <SubscriptionStatusBadge status={data.subscription.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-500">Próximo cobro</span>
                  <span className="text-sm font-medium text-primary-900">
                    {new Date(data.subscription.nextBillingAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-500">Período actual</span>
                  <span className="text-sm font-medium text-primary-900">
                    {new Date(data.subscription.currentPeriodStart).toLocaleDateString('es-MX')} - {' '}
                    {new Date(data.subscription.currentPeriodEnd).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Estado de facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.billingStatus === 'active' && (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-success-900">Al día</h3>
                    <p className="text-sm text-success-700">
                      Tu cuenta está al día. Próximo pago en {data.daysUntilDue} días.
                    </p>
                  </div>
                </div>
              )}

              {data.billingStatus === 'grace_period' && (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-warning-900">Período de gracia</h3>
                    <p className="text-sm text-warning-700">
                      Tienes {data.graceDaysRemaining} días para pagar antes de la suspensión.
                    </p>
                  </div>
                </div>
              )}

              {data.billingStatus === 'suspended' && (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-danger-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-danger-900">Suspendido</h3>
                    <p className="text-sm text-danger-700">
                      Tu cuenta está suspendida. Paga la factura pendiente para reactivar.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t-2 border-primary-200">
                <Button className="w-full gap-2" asChild>
                  <Link href="/settings">
                    Cambiar plan <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facturas
          </CardTitle>
          <CardDescription>
            Historial de facturas y pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.invoices.length === 0 ? (
            <div className="text-center py-12 text-primary-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2 text-primary-900">No hay facturas</p>
              <p className="text-sm">Las facturas aparecerán aquí cuando se generen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.invoices.map((invoice: any) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Activo', variant: 'success' as const },
    grace_period: { label: 'Gracia', variant: 'warning' as const },
    suspended: { label: 'Suspendido', variant: 'destructive' as const },
    cancelled: { label: 'Cancelado', variant: 'secondary' as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

function InvoiceRow({ invoice }: { invoice: any }) {
  const statusConfig = {
    pending: { label: 'Pendiente', variant: 'warning' as const },
    paid: { label: 'Pagado', variant: 'success' as const },
    expired: { label: 'Expirado', variant: 'destructive' as const },
    cancelled: { label: 'Cancelado', variant: 'secondary' as const },
  }

  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-action-100 rounded-lg flex items-center justify-center text-action-600">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-primary-900">
            {invoice.concept}
          </p>
          <p className="text-sm text-primary-500">
            {new Date(invoice.createdAt).toLocaleDateString('es-MX')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-lg font-bold text-primary-900">
            ${invoice.amountMxn.toLocaleString('es-MX')} MXN
          </p>
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        </div>

        {invoice.status === 'pending' && (
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Pagar
          </Button>
        )}

        {invoice.status === 'paid' && (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
