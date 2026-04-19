import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Calendar,
  DollarSign,
  User,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getQuoteInvoices() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    // Get orders that have been converted from quotes (these are the quote invoices)
    const orders = await prisma.order.findMany({
      where: { 
        companyId,
        quoteId: { not: null } // Only orders that came from quotes
      },
      include: { 
        customer: true,
        quote: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return orders
  } catch (error) {
    console.error('Error fetching quote invoices:', error)
    return []
  }
}

export default async function BillingPage() {
  const orders = await getQuoteInvoices()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Facturación</h1>
          <p className="text-primary-500 mt-1">
            Facturas generadas a partir de cotizaciones y pedidos
          </p>
        </div>
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/subscription">
            <FileText className="h-4 w-4" />
            Ver suscripción
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por cliente o número de pedido..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quote Invoices List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay facturas</h3>
            <p className="text-primary-500 text-center max-w-md mb-6">
              Las facturas aparecerán aquí cuando se generen pedidos a partir de cotizaciones.
            </p>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/quotes">
                <FileText className="h-4 w-4" />
                Ver cotizaciones
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <QuoteInvoiceCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuoteInvoiceCard({ order }: { order: any }) {
  const statusConfig = {
    pending: { 
      label: 'Pendiente', 
      variant: 'warning' as const,
      icon: <Clock className="h-3 w-3" />
    },
    in_progress: { 
      label: 'En proceso', 
      variant: 'info' as const,
      icon: <Clock className="h-3 w-3" />
    },
    completed: { 
      label: 'Completado', 
      variant: 'success' as const,
      icon: <CheckCircle className="h-3 w-3" />
    },
    cancelled: { 
      label: 'Cancelado', 
      variant: 'destructive' as const,
      icon: <XCircle className="h-3 w-3" />
    },
  }

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
  
  const totalPaid = order.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const remaining = order.total - totalPaid
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Quote and Customer Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-action-100 rounded-lg flex items-center justify-center text-action-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-900">{order.customer.businessName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={config.variant} className="gap-1">
                    {config.icon}
                    {config.label}
                  </Badge>
                  <span className="text-sm text-primary-500">
                    Pedido #{order.id.slice(0, 8)}
                  </span>
                  {order.quote && (
                    <Badge variant="outline" className="gap-1">
                      Cotización #{order.quote.folio}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
  
          {/* Middle: Date and Totals */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(order.createdAt).toLocaleDateString('es-MX')}</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold text-primary-900">
                <DollarSign className="h-5 w-5" />
                {order.total.toLocaleString('es-MX')}
              </div>
              <div className="text-sm text-primary-500">
                Pagado: ${totalPaid.toLocaleString('es-MX')}
                {remaining > 0 && (
                  <span className="text-warning-600 ml-2">
                    Pendiente: ${remaining.toLocaleString('es-MX')}
                  </span>
                )}
              </div>
            </div>
          </div>
  
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href={`/orders/${order.id}`}>
                <FileText className="h-4 w-4" />
                Ver pedido
              </Link>
            </Button>
            {order.quote && (
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link href={`/quotes/${order.quote.id}`}>
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
