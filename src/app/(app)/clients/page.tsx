import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Package,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

async function getClients() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const clients = await prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            quotes: true,
            orders: true,
            invoices: true,
          }
        }
      }
    })

    return clients
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Clientes</h1>
          <p className="text-primary-500 mt-1">
            Gestiona tu cartera de clientes
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por nombre, email o RFC..."
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay clientes registrados</h3>
            <p className="text-primary-500 text-center max-w-md mb-6">
              Comienza agregando tu primer cliente para empezar a gestionar tus cotizaciones y pedidos.
            </p>
            <Button asChild className="gap-2">
              <Link href="/clients/new">
                <Plus className="h-4 w-4" />
                Crear primer cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client: any) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClientCard({ client }: { client: any }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 text-primary-900">{client.name}</CardTitle>
            {client.rfc && (
              <CardDescription className="text-xs font-mono text-primary-500">
                RFC: {client.rfc}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/clients/${client.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-2 text-sm text-primary-500">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{client.address}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t-2 border-primary-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-action-600">
              <FileText className="h-3 w-3" />
              {client._count.quotes}
            </div>
            <div className="text-xs text-primary-500">Cotizaciones</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-success-600">
              <Package className="h-3 w-3" />
              {client._count.orders}
            </div>
            <div className="text-xs text-primary-500">Pedidos</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-primary-700">
              <DollarSign className="h-3 w-3" />
              {client._count.invoices}
            </div>
            <div className="text-xs text-primary-500">Facturas</div>
          </div>
        </div>

        {/* View Details Button */}
        <Button variant="outline" className="w-full gap-2" asChild>
          <Link href={`/clients/${client.id}`}>
            Ver detalles <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
