import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Package,
  DollarSign,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { userId, companyId } = sessionData

    // Get counts
    const [quotesCount, ordersCount, invoicesCount, clientsCount] = await Promise.all([
      prisma.quote.count({
        where: { companyId }
      }),
      prisma.order.count({
        where: { companyId }
      }),
      prisma.invoice.count({
        where: { companyId }
      }),
      prisma.customer.count({
        where: { companyId }
      })
    ])

    // Get recent activity
    const recentQuotes = await prisma.quote.findMany({
      where: { companyId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentOrders = await prisma.order.findMany({
      where: { companyId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: { 
        companyId,
        status: 'pending'
      }
    })

    // Get expired invoices
    const expiredInvoices = await prisma.invoice.count({
      where: { 
        companyId,
        status: 'expired'
      }
    })

    // Get recent activity for timeline
    const recentActivity = await prisma.$queryRaw`
      SELECT
        'quote' as type,
        q.id,
        q."createdAt" as date,
        c."businessName" as client_name,
        q.total,
        q.status::text
      FROM quotes q
      JOIN customers c ON q."customerId" = c.id
      WHERE q."companyId" = ${companyId}
      UNION ALL
      SELECT
        'order' as type,
        o.id,
        o."createdAt" as date,
        c."businessName" as client_name,
        o.total,
        o.status::text
      FROM orders o
      JOIN customers c ON o."customerId" = c.id
      WHERE o."companyId" = ${companyId}
      ORDER BY date DESC
      LIMIT 10
    `

    return {
      quotesCount,
      ordersCount,
      invoicesCount,
      clientsCount,
      recentQuotes,
      recentOrders,
      pendingOrders,
      expiredInvoices,
      recentActivity
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      quotesCount: 0,
      ordersCount: 0,
      invoicesCount: 0,
      clientsCount: 0,
      recentQuotes: [],
      recentOrders: [],
      pendingOrders: 0,
      expiredInvoices: 0,
      recentActivity: []
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-action-600 to-action-700 rounded-2xl p-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Bienvenido a CotizaNet
          </h1>
          <p className="text-action-100 text-lg">
            Gestiona tus cotizaciones, pedidos y cobranza desde un solo lugar
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cotizaciones"
          value={data.quotesCount}
          icon={<FileText className="h-5 w-5" />}
          description="Total creadas"
          trend="+12% este mes"
          trendUp={true}
        />
        <StatCard
          title="Pedidos"
          value={data.ordersCount}
          icon={<Package className="h-5 w-5" />}
          description={`${data.pendingOrders} pendientes`}
          trend="+8% este mes"
          trendUp={true}
        />
        <StatCard
          title="Facturas"
          value={data.invoicesCount}
          icon={<DollarSign className="h-5 w-5" />}
          description={`${data.expiredInvoices} vencidas`}
          trend="+5% este mes"
          trendUp={true}
        />
        <StatCard
          title="Clientes"
          value={data.clientsCount}
          icon={<Users className="h-5 w-5" />}
          description="Registrados"
          trend="+15% este mes"
          trendUp={true}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-primary-900">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Nueva cotización"
            description="Crea una cotización para un cliente"
            icon={<FileText className="h-6 w-6" />}
            href="/quotes/new"
            color="blue"
          />
          <QuickActionCard
            title="Nuevo pedido"
            description="Registra un pedido de cliente"
            icon={<Package className="h-6 w-6" />}
            href="/orders/new"
            color="green"
          />
          <QuickActionCard
            title="Nuevo cliente"
            description="Agrega un cliente nuevo"
            icon={<Users className="h-6 w-6" />}
            href="/clients/new"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cotizaciones recientes</CardTitle>
                <CardDescription>Últimas 5 cotizaciones creadas</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/quotes">
                  Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentQuotes.length === 0 ? (
              <div className="text-center py-12 text-primary-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2 text-primary-900">No hay cotizaciones aún</p>
                <Button variant="link" className="mt-4" asChild>
                  <Link href="/quotes/new">Crear primera cotización</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentQuotes.map((quote: any) => (
                  <div key={quote.id} className="flex items-start justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-base text-primary-900">{quote.customer.businessName}</p>
                        <StatusBadge status={quote.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-primary-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(quote.createdAt).toLocaleDateString('es-MX')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-900">${quote.total.toLocaleString('es-MX')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pedidos recientes</CardTitle>
                <CardDescription>Últimos 5 pedidos registrados</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders">
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <div className="text-center py-12 text-primary-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2 text-primary-900">No hay pedidos aún</p>
                <Button variant="link" className="mt-4" asChild>
                  <Link href="/orders/new">Crear primer pedido</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-start justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-base text-primary-900">{order.customer.businessName}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-primary-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('es-MX')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-900">${order.total.toLocaleString('es-MX')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, description, trend, trendUp }: { 
  title: string, 
  value: number, 
  icon: React.ReactNode, 
  description: string,
  trend?: string,
  trendUp?: boolean
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-action-100 rounded-lg flex items-center justify-center text-action-600">
            {icon}
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-primary-900">{title}</CardTitle>
            <CardDescription className="text-xs text-primary-500">{description}</CardDescription>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success-600' : 'text-danger-600'}`}>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4 rotate-90" />}
            {trend}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary-900">{value}</div>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({ title, description, icon, href, color }: { 
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  href: string,
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'hover:bg-action-50 hover:border-action-200',
    green: 'hover:bg-success-50 hover:border-success-200',
    purple: 'hover:bg-primary-100 hover:border-primary-200',
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${colorClasses[color]}`}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-action-100 rounded-xl flex items-center justify-center text-action-600">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg text-primary-900">{title}</CardTitle>
            <CardDescription className="text-sm text-primary-500">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button className="w-full" variant="outline" asChild>
          <Link href={href}>
            Comenzar <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    draft: { label: 'Borrador', variant: 'secondary' as const },
    sent: { label: 'Enviada', variant: 'info' as const },
    accepted: { label: 'Aceptada', variant: 'success' as const },
    rejected: { label: 'Rechazada', variant: 'destructive' as const },
    pending: { label: 'Pendiente', variant: 'warning' as const },
    in_progress: { label: 'En proceso', variant: 'info' as const },
    completed: { label: 'Completado', variant: 'success' as const },
    cancelled: { label: 'Cancelado', variant: 'destructive' as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
