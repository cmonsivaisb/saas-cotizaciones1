import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Building2, Calendar, DollarSign, ArrowLeft, CheckCircle, AlertTriangle, XCircle, PauseCircle, PlayCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getSubscription(id: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      company: true,
      plan: true,
      subscriptionInvoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  return subscription
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SubscriptionDetailPage({ params }: Props) {
  const { id } = await params
  const subscription = await getSubscription(id)

  if (!subscription) {
    notFound()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'grace_period':
        return <AlertTriangle className="h-5 w-5 text-warning-600" />
      case 'suspended':
        return <PauseCircle className="h-5 w-5 text-danger-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-danger-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-warning-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-success-600',
      grace_period: 'bg-warning-600',
      suspended: 'bg-danger-600',
      cancelled: 'bg-danger-600',
      pilot: 'bg-action-600',
    }
    const labels: Record<string, string> = {
      active: 'Activa',
      grace_period: 'Período de Gracia',
      suspended: 'Suspendida',
      cancelled: 'Cancelada',
      pilot: 'Piloto',
    }
    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/admin/subscriptions"
          className="flex items-center gap-2 text-primary-700 hover:text-primary-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Suscripciones
        </Link>
        {(subscription.status === 'suspended' || subscription.status === 'grace_period') && (
          <form method="POST" action="/api/admin/subscriptions/reactivate">
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <Button type="submit" variant="default" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Reactivar
            </Button>
          </form>
        )}
        {subscription.status === 'active' && (
          <form method="POST" action="/api/admin/subscriptions/suspend">
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <Button type="submit" variant="destructive" className="gap-2">
              <PauseCircle className="h-4 w-4" />
              Suspender
            </Button>
          </form>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{subscription.company.name}</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(subscription.status)}
                {getStatusBadge(subscription.status)}
              </div>
            </CardTitle>
            <CardDescription>Empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-primary-700">
              <CreditCard className="h-4 w-4" />
              <span>{subscription.plan.name}</span>
            </div>
            <div className="flex items-center gap-3 text-primary-700">
              <DollarSign className="h-4 w-4" />
              <span>${subscription.plan.priceMxn}/mes</span>
            </div>
            <div className="flex items-center gap-3 text-primary-700">
              <Calendar className="h-4 w-4" />
              <span>
                Período: {new Date(subscription.currentPeriodStart).toLocaleDateString('es-MX')} - {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-MX')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-primary-700">
              <Calendar className="h-4 w-4" />
              <span>
                Próximo cobro: {subscription.nextBillingAt ? new Date(subscription.nextBillingAt).toLocaleDateString('es-MX') : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suscripción</CardTitle>
            <CardDescription>ID: {subscription.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Creada: {new Date(subscription.createdAt).toLocaleDateString('es-MX')}</p>
              <p>Última actualización: {new Date(subscription.updatedAt).toLocaleDateString('es-MX')}</p>
              {subscription.suspendedAt && (
                <p>Suspendida: {new Date(subscription.suspendedAt).toLocaleDateString('es-MX')}</p>
              )}
              {subscription.graceUntil && (
                <p>Gracia hasta: {new Date(subscription.graceUntil).toLocaleDateString('es-MX')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription.subscriptionInvoices.length === 0 ? (
              <p className="text-muted-foreground">No hay facturas</p>
            ) : (
              <div className="space-y-2">
                {subscription.subscriptionInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{invoice.concept}</span>
                    <div className="flex items-center gap-2">
                      <span>${invoice.amountMxn} MXN</span>
                      <Badge className={invoice.status === 'paid' ? 'bg-success-600' : 'bg-warning-600'}>
                        {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex gap-4">
              <select 
                name="planId" 
                defaultValue={subscription.planId}
                className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white"
              >
                <option value={subscription.planId}>{subscription.plan.name}</option>
              </select>
              <Button type="submit" variant="default">
                Cambiar Plan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}