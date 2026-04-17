import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Plus, 
  Search, 
  Calendar,
  User,
  ArrowRight,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from "lucide-react"
import Link from "next/link"

async function getInvoices() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    })

    return invoices
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Facturas</h1>
          <p className="text-primary-500 mt-1">
            Gestiona tus facturas y cobranza
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            Nueva factura
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
                placeholder="Buscar por cliente o folio..."
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

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay facturas aún</h3>
            <p className="text-primary-500 text-center max-w-md mb-6">
              Comienza creando tu primera factura para un cliente.
            </p>
            <Button asChild className="gap-2">
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                Crear primera factura
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

function InvoiceCard({ invoice }: { invoice: any }) {
  const statusConfig = {
    draft: { 
      label: 'Borrador', 
      variant: 'secondary' as const,
      icon: <FileText className="h-3 w-3" />
    },
    sent: { 
      label: 'Enviada', 
      variant: 'info' as const,
      icon: <FileText className="h-3 w-3" />
    },
    paid: { 
      label: 'Pagada', 
      variant: 'success' as const,
      icon: <CheckCircle className="h-3 w-3" />
    },
    overdue: { 
      label: 'Vencida', 
      variant: 'destructive' as const,
      icon: <AlertTriangle className="h-3 w-3" />
    },
    cancelled: { 
      label: 'Cancelada', 
      variant: 'secondary' as const,
      icon: <XCircle className="h-3 w-3" />
    },
  }

  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Client and Status */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-action-100 rounded-lg flex items-center justify-center text-action-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-900">{invoice.client.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={config.variant} className="gap-1">
                    {config.icon}
                    {config.label}
                  </Badge>
                  <span className="text-sm text-primary-500">
                    Folio: {invoice.folio || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
 
          {/* Middle: Date and Total */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(invoice.createdAt).toLocaleDateString('es-MX')}</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold text-primary-900">
                <DollarSign className="h-5 w-5" />
                {invoice.total.toLocaleString('es-MX')}
              </div>
            </div>
          </div>
 
          {/* Right: Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <Link href={`/invoices/${invoice.id}`}>
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
