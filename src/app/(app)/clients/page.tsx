import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ClientSearch from "@/components/client-search"
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Pencil
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getClients(search?: string, page = 1, pageSize = 10, status?: string, dateFrom?: string, dateTo?: string) {
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
        { businessName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const include: any = {
      _count: {
        select: {
          quotes: true,
          orders: true,
        }
      }
    }

    let clients = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include,
    })

    if (status && status !== 'all') {
      clients = clients.filter((c: any) => {
        if (status === 'active') return c._count.orders > 0
        if (status === 'no_orders') return !c._count.orders || c._count.orders === 0
        if (status === 'with_quotes') return c._count.quotes > 0
        return true
      })
    }

    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(dateFrom) : new Date('1970-01-01')
      const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : new Date()
      
      clients = clients.filter((c: any) => {
        const created = new Date(c.createdAt)
        return created >= fromDate && created <= toDate
      })
    }

    const total = await prisma.customer.count({ where })

    return { clients, total }
  } catch (error) {
    console.error('Error fetching clients:', error)
    return { clients: [], total: 0 }
  }
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string; status?: string; dateFrom?: string; dateTo?: string }> }) {
  const params = await searchParams
  const search = params.search
  const status = params.status
  const dateFrom = params.dateFrom
  const dateTo = params.dateTo
  const page = parseInt(params.page || '1')
  const pageSize = 10
  
  const { clients, total } = await getClients(search, page, pageSize, status, dateFrom, dateTo)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Clientes</h1>
          <p className="text-primary-500 mt-1">
            Administra tus clientes
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ClientSearch 
            totalItems={total} 
            pageSize={pageSize} 
            placeholder="Buscar por nombre, email o teléfono..."
            basePath="/clients"
            showStatus={true}
            showDates={true}
          />
        </CardContent>
      </Card>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay clientes todavía</p>
            <Button asChild>
              <Link href="/clients/new">Crear primer cliente</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client: any) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-lg">{client.businessName}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {client.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {client._count.quotes} cotizaciones
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {client._count.orders} pedidos
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link href={`/clients/${client.id}`}>
                        <Eye className="h-4 w-4" />
                        Ver
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2" asChild>
                      <Link href={`/clients/${client.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}