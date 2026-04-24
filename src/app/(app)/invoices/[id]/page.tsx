import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ExternalLink,
  Printer
} from "lucide-react"
import Link from "next/link"
import PrintInvoiceButton from "./print-invoice-button"

export const dynamic = 'force-dynamic'

async function getInvoice(invoiceId: string, companyId: string) {
  try {
    return await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
      },
      include: {
        company: true,
        order: {
          include: {
            customer: true,
            quote: true,
            payments: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return null
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  const sessionData = JSON.parse(session)
  const { companyId } = sessionData

  const invoice = await getInvoice(id, companyId)

  if (!invoice) {
    notFound()
  }

  const statusConfig = {
    paid: {
      label: 'Pagada',
      variant: 'success' as const,
      icon: <CheckCircle className="h-4 w-4" />
    },
    pending: {
      label: 'Pendiente',
      variant: 'warning' as const,
      icon: <Clock className="h-4 w-4" />
    },
    cancelled: {
      label: 'Cancelada',
      variant: 'destructive' as const,
      icon: <XCircle className="h-4 w-4" />
    },
    expired: {
      label: 'Expirada',
      variant: 'destructive' as const,
      icon: <XCircle className="h-4 w-4" />
    },
  }

  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.pending
  const totalPaid = invoice.order?.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) ?? 0
  const remaining = Math.max(invoice.amountMxn - totalPaid, 0)
  const isFromOrder = !!invoice.order

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/billing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-900">{invoice.concept}</h1>
            <p className="text-primary-500 mt-1">
              Detalles de la factura
              {isFromOrder && (
                <span className="ml-2 text-sm">
                  <ExternalLink className="h-3 w-3" />
                  Generada desde pedido
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center no-print">
          <PrintInvoiceButton invoiceId={invoice.id} />
          {invoice.order && (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href={`/orders/${invoice.order.id}`}>
                <FileText className="h-4 w-4" />
                Ver pedido
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant={config.variant} className="gap-1">
                {config.icon}
                {config.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-primary-500">
                <Calendar className="h-4 w-4" />
                <span>Creacion: {new Date(invoice.createdAt).toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-500">
                <Calendar className="h-4 w-4" />
                <span>Vence: {new Date(invoice.dueAt).toLocaleDateString('es-MX')}</span>
              </div>
              {invoice.paidAt && (
                <div className="flex items-center gap-2 text-sm text-success-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Pagada: {new Date(invoice.paidAt).toLocaleDateString('es-MX')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Subtotal:</span>
                <span className="font-bold text-lg">${invoice.amountMxn.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Pagado:</span>
                <span className="font-medium text-success-600">${totalPaid.toLocaleString('es-MX')}</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-primary-500">Pendiente:</span>
                  <span className="font-medium text-warning-600">${remaining.toLocaleString('es-MX')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {invoice.order?.customer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-semibold text-primary-900">{invoice.order.customer.businessName}</p>
                <p className="text-sm text-primary-500">{invoice.order.customer.contactName}</p>
                <p className="text-sm text-primary-500">{invoice.order.customer.phone}</p>
                {invoice.order.customer.email && (
                  <p className="text-sm text-primary-500">{invoice.order.customer.email}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informacion de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-primary-900">{invoice.company.name}</p>
              <p className="text-sm text-primary-500">{invoice.company.email}</p>
            </div>
            {invoice.company.phone && (
              <div>
                <p className="font-semibold text-primary-900">Telefono</p>
                <p className="text-sm text-primary-500">{invoice.company.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {(invoice.order?.payments?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.order!.payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <div>
                      <p className="font-medium text-primary-900">Pago registrado</p>
                      <p className="text-sm text-primary-500">
                        {payment.method} {payment.notes ? `- ${payment.notes}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary-900">${payment.amount.toLocaleString('es-MX')}</p>
                    <p className="text-sm text-primary-500">
                      {new Date(payment.paymentDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {invoice.order && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pedido Relacionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary-900">Pedido #{invoice.order.orderNumber}</p>
                {invoice.order.quickReference && (
                  <p className="text-sm text-primary-500">{invoice.order.quickReference}</p>
                )}
                <p className="text-sm text-primary-500">
                  Total: ${invoice.order.total.toLocaleString('es-MX')}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/orders/${invoice.order.id}`}>
                  Ver pedido completo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {invoice.order?.quote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cotizacion Relacionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary-900">Cotizacion #{invoice.order.quote.quoteNumber}</p>
                <p className="text-sm text-primary-500">
                  Fecha: {new Date(invoice.order.quote.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/quotes/${invoice.order.quote.id}`}>
                  Ver cotizacion
</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
