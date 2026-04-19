import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Printer,
  FileText
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getOrder(orderId: string) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        companyId
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        payments: true,
        quote: true
      }
    })

    if (!order) {
      return null
    }

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const statusConfig = {
    pending: { 
      label: 'Pendiente', 
      variant: 'warning' as const,
      icon: <Clock className="h-4 w-4" />
    },
    in_progress: { 
      label: 'En proceso', 
      variant: 'info' as const,
      icon: <Truck className="h-4 w-4" />
    },
    partial_delivered: { 
      label: 'Entrega parcial', 
      variant: 'info' as const,
      icon: <Truck className="h-4 w-4" />
    },
    delivered: { 
      label: 'Entregado', 
      variant: 'success' as const,
      icon: <CheckCircle className="h-4 w-4" />
    },
    cancelled: { 
      label: 'Cancelado', 
      variant: 'destructive' as const,
      icon: <XCircle className="h-4 w-4" />
    },
  }

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending

  const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remaining = order.total - totalPaid

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-900">Pedido #{order.id.slice(0, 8)}</h1>
            <p className="text-primary-500 mt-1">
              Detalles del pedido
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/orders/${order.id}/edit`}>
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          {order.quote && (
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/billing">
                <FileText className="h-4 w-4" />
                Ver facturación
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Status and Customer Info */}
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
                <span>Creado: {new Date(order.createdAt).toLocaleDateString('es-MX')}</span>
              </div>
              {order.dueDate && (
                <div className="flex items-center gap-2 text-sm text-primary-500">
                  <Calendar className="h-4 w-4" />
                  <span>Entrega: {new Date(order.dueDate).toLocaleDateString('es-MX')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-semibold text-primary-900">{order.customer.businessName}</p>
              <p className="text-sm text-primary-500">{order.customer.contactName}</p>
              <p className="text-sm text-primary-500">{order.customer.phone}</p>
              {order.customer.email && (
                <p className="text-sm text-primary-500">{order.customer.email}</p>
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
                <span className="font-medium">${order.subtotal.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Total:</span>
                <span className="font-bold text-lg">${order.total.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-500">Pagado:</span>
                <span className="font-medium text-success-600">${totalPaid.toLocaleString('es-MX')}</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-primary-500">Pendiente:</span>
                  <span className="font-medium text-warning-600">${remaining.toLocaleString('es-MX')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Artículos del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-primary-900">{item.description}</p>
                  {item.item && (
                    <p className="text-sm text-primary-500">SKU: {item.item.sku || 'N/A'}</p>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-primary-500">Cantidad</p>
                    <p className="font-semibold">{item.qty}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-primary-500">Precio Unit.</p>
                    <p className="font-semibold">${item.unitPrice.toLocaleString('es-MX')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-primary-500">Total</p>
                    <p className="font-bold text-lg">${item.amount.toLocaleString('es-MX')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      {order.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div>
                    <p className="font-medium text-primary-900">${payment.amount.toLocaleString('es-MX')}</p>
                    <p className="text-sm text-primary-500">{payment.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-500">
                      {new Date(payment.paymentDate).toLocaleDateString('es-MX')}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-primary-500">{payment.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-primary-700">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Related Quote */}
      {order.quote && (
        <Card>
          <CardHeader>
            <CardTitle>Cotización Relacionada</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/quotes/${order.quote.id}`}>
                Ver cotización #{order.quote.folio}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
