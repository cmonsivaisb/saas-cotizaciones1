import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SuccessMessage from './success-message'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  ExternalLink,
  Eye,
  Pencil
} from "lucide-react"
import Link from "next/link"
import ClientSearch from "@/components/client-search"

const invoiceStatusOptions = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagada" },
  { value: "cancelled", label: "Cancelada" },
]

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

interface Invoice {
  id: string
  concept: string
  amountMxn: number
  currency: string
  status: string
  dueAt: Date
  createdAt: Date
  company: any
  order?: any
}

async function getInvoices(search?: string, page = 1, pageSize = 10, status?: string, dateFrom?: string, dateTo?: string) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const where: any = { companyId }
    
    if (search) {
      where.OR = [
        { concept: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
        { order: { customer: { businessName: { contains: search, mode: 'insensitive' } } } },
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.invoice.count({ where }),
    ])

    return { invoices: invoices as Invoice[], total }
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return { invoices: [], total: 0 }
  }
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string; status?: string; dateFrom?: string; dateTo?: string }> }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  const sessionData = JSON.parse(session)
  const { companyId } = sessionData

  const params = await searchParams
  const search = params.search
  const page = parseInt(params.page || '1')
  const pageSize = 10
  const status = params.status
  const dateFrom = params.dateFrom
  const dateTo = params.dateTo

  const { invoices, total } = await getInvoices(search, page, pageSize, status, dateFrom, dateTo)

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <SuccessMessage />

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
          <ClientSearch 
            totalItems={total} 
            pageSize={pageSize} 
            placeholder="Buscar por cliente, folio o concepto..."
            basePath="/billing"
            statusOptions={invoiceStatusOptions}
            showStatus={true}
            showDates={true}
          />
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
            <p className="text-primary-500 text-center max-w-md mb-6">
              Las facturas aparecerán aquí cuando se generen desde pedidos entregados o cotizaciones convertidas.
            </p>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/orders">
                <FileText className="h-4 w-4" />
                Ver pedidos
              </Link>
            </Button>
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

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const statusConfig = {
    paid: { 
      label: 'Pagada', 
      variant: 'success' as const,
      icon: <CheckCircle className="h-3 w-3" />
    },
    pending: { 
      label: 'Pendiente', 
      variant: 'warning' as const,
      icon: <Clock className="h-3 w-3" />
    },
    cancelled: { 
      label: 'Cancelada', 
      variant: 'destructive' as const,
      icon: <XCircle className="h-3 w-3" />
    },
  }

  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.pending
  
  const totalPaid = invoice.order?.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) ?? 0
  const remaining = invoice.amountMxn - totalPaid
  const isFromOrder = !!invoice.order

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Invoice Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-action-100 rounded-lg flex items-center justify-center text-action-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-primary-900">{invoice.concept}</h3>
                  {isFromOrder && (
                    <Badge variant="outline" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Desde Pedido
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={config.variant} className="gap-1">
                    {config.icon}
                    {config.label}
                  </Badge>
                  {invoice.order?.customer && (
                    <span className="text-sm text-primary-500">
                      {invoice.order.customer.businessName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
  
          {/* Middle: Date and Totals */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-primary-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date(invoice.createdAt).toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-500">
                <Calendar className="h-4 w-4" />
                <span>Vence: {new Date(invoice.dueAt).toLocaleDateString('es-MX')}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold text-primary-900">
                <DollarSign className="h-5 w-5" />
                {invoice.amountMxn.toLocaleString('es-MX')}
              </div>
              <div className="text-sm text-primary-500">
                Pagado: ${totalPaid.toLocaleString('es-MX')}
                {remaining > 0 && (
                  <span className="text-warning-600 ml-2 block">
                    Pendiente: ${remaining.toLocaleString('es-MX')}
                  </span>
                )}
              </div>
            </div>
          </div>
  
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href={`/invoices/${invoice.id}`}>
                <Eye className="h-4 w-4" />
                Ver factura
              </Link>
            </Button>
            {invoice.order && (
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link href={`/orders/${invoice.order.id}`}>
                  <Pencil className="h-4 w-4" />
                  Ver pedido
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
