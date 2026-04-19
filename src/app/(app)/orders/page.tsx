import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Plus,
  Search,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  Filter,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getOrders() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const orders = await prisma.order.findMany({
      where: { companyId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    })

    return orders
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Pedidos</h1>
          <p className="text-primary-500 mt-1">
            Gestiona los pedidos de tus clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/billing">
              <FileText className="h-4 w-4" />
              Ver facturación
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/orders/new">
              <Plus className="h-4 w-4" />
              Nuevo pedido
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por cliente o número..."
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

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay pedidos aún</h3>
            <p className="text-primary-500 text-center max-w-md mb-6">
              Comienza registrando tu primer pedido de cliente.
            </p>
            <Button asChild className="gap-2">
              <Link href="/orders/new">
                <Plus className="h-4 w-4" />
                Crear primer pedido
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: any }) {
  const statusConfig = {
    pending: { 
      label: 'Pendiente', 
      variant: 'warning' as const,
      icon: <Clock className="h-3 w-3" />
    },
    in_progress: { 
      label: 'En proceso', 
      variant: 'info' as const,
      icon: <Truck className="h-3 w-3" />
    },
    partial_delivered: { 
      label: 'Entrega parcial', 
      variant: 'info' as const,
      icon: <Truck className="h-3 w-3" />
    },
    delivered: { 
      label: 'Entregado', 
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
                <h3 className="font-semibold text-lg text-primary-900">{order.customer.businessName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={config.variant} className="gap-1">
                    {config.icon}
                    {config.label}
                  </Badge>
                  <span className="text-sm text-primary-500">
                    #{order.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
 
          {/* Middle: Date and Total */}
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
            </div>
          </div>
 
          {/* Right: Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <Link href={`/orders/${order.id}`}>
                <Package className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
