import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ClientSearch from "@/components/client-search"
import {
  FileText,
  Plus,
  DollarSign,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Pencil
} from "lucide-react"
import Link from "next/link"

const quoteStatusOptions = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviada" },
  { value: "follow_up", label: "Seguimiento" },
  { value: "approved", label: "Aprobada" },
  { value: "rejected", label: "Rechazada" },
  { value: "expired", label: "Expirada" },
]

export const dynamic = 'force-dynamic'

async function getQuotes(search?: string, page = 1, pageSize = 10) {
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
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        { id: { contains: search } },
      ]
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.quote.count({ where }),
    ])

    return { quotes, total }
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return { quotes: [], total: 0 }
  }
}

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string; status?: string; dateFrom?: string; dateTo?: string }> }) {
  const params = await searchParams
  const search = params.search
  const page = parseInt(params.page || '1')
  const pageSize = 10
  
  const { quotes, total } = await getQuotes(search, page, pageSize)

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: Edit },
    sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-800', icon: Send },
    accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: XCircle },
    follow_up: { label: 'Seguimiento', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Cotizaciones</h1>
          <p className="text-primary-500 mt-1">
            Gestiona tus cotizaciones y conviértelas en pedidos
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/quotes/new">
            <Plus className="h-4 w-4" />
            Nueva cotización
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ClientSearch 
            totalItems={total} 
            pageSize={pageSize} 
            placeholder="Buscar por cliente..."
            basePath="/quotes"
            statusOptions={quoteStatusOptions}
            showStatus={true}
            showDates={true}
          />
        </CardContent>
      </Card>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay cotizaciones todavía</p>
            <Button asChild>
              <Link href="/quotes/new">Crear primera cotización</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote: any) => {
            const config = statusConfig[quote.status as keyof typeof statusConfig] || statusConfig.draft
            return (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-lg">
                          #{quote.quoteNumber}{quote.quickReference ? ` - ${quote.quickReference}` : ''}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="font-medium">{quote.customer.businessName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(quote.createdAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${quote.total.toLocaleString('es-MX')}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <Link href={`/quotes/${quote.id}`}>
                            <Eye className="h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2" asChild>
                          <Link href={`/quotes/${quote.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}