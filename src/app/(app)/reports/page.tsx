import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  FileText,
  Package,
  Receipt,
  Users,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getReportData() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  const { companyId } = JSON.parse(session)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalQuotes,
    approvedQuotes,
    quotesThisMonth,
    ordersThisMonth,
    paymentsThisMonth,
    pendingInvoices,
    recentInvoices,
    inventoryItems,
    topCustomerOrders,
  ] = await Promise.all([
    prisma.quote.count({ where: { companyId } }),
    prisma.quote.count({ where: { companyId, status: 'approved' } }),
    prisma.quote.aggregate({
      where: { companyId, createdAt: { gte: monthStart } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { companyId, createdAt: { gte: monthStart } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.orderPayment.aggregate({
      where: { companyId, paymentDate: { gte: monthStart } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { companyId, status: { in: ['pending', 'expired'] } },
      _sum: { amountMxn: true },
      _count: { _all: true },
    }),
    prisma.invoice.findMany({
      where: { companyId, status: { in: ['pending', 'expired'] } },
      orderBy: { dueAt: 'asc' },
      take: 5,
    }),
    prisma.item.findMany({
      where: { companyId, isActive: true },
      orderBy: { stockQuantity: 'asc' },
      take: 100,
    }),
    prisma.order.groupBy({
      by: ['customerId'],
      where: { companyId },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
  ])

  const customerIds = topCustomerOrders.map((order) => order.customerId)
  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, businessName: true },
  })
  const customerById = new Map(customers.map((customer) => [customer.id, customer.businessName]))

  const lowStockItems = inventoryItems
    .filter((item) => item.stockQuantity <= item.minimumStock)
    .slice(0, 6)

  const monthlySales = ordersThisMonth._sum.total ?? 0
  const monthlyQuotes = quotesThisMonth._sum.total ?? 0
  const collected = paymentsThisMonth._sum.amount ?? 0
  const outstanding = pendingInvoices._sum.amountMxn ?? 0
  const conversionRate = totalQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0
  const averageOrder = ordersThisMonth._count._all > 0 ? monthlySales / ordersThisMonth._count._all : 0

  return {
    monthlySales,
    monthlyQuotes,
    collected,
    outstanding,
    conversionRate,
    averageOrder,
    quoteCount: quotesThisMonth._count._all,
    orderCount: ordersThisMonth._count._all,
    paymentCount: paymentsThisMonth._count._all,
    pendingInvoiceCount: pendingInvoices._count._all,
    recentInvoices,
    lowStockItems,
    topCustomers: topCustomerOrders.map((order) => ({
      customerId: order.customerId,
      name: customerById.get(order.customerId) ?? 'Cliente sin nombre',
      total: order._sum.total ?? 0,
      orders: order._count._all,
    })),
  }
}

export default async function ReportsPage() {
  const data = await getReportData()
  const maxCustomerTotal = Math.max(...data.topCustomers.map((customer) => customer.total), 1)

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-2 border-primary-200 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-action-50 px-3 py-1 text-sm font-medium text-action-700">
              <BarChart3 className="h-4 w-4" />
              Reportes operativos
            </div>
            <h1 className="text-3xl font-bold text-primary-900">Control de ventas, cobranza e inventario</h1>
            <p className="mt-2 max-w-2xl text-primary-500">
              Indicadores calculados con tus cotizaciones, pedidos, pagos y facturas para tomar decisiones sin hojas de calculo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/quotes/new">Nueva cotizacion</Link>
            </Button>
            <Button asChild>
              <Link href="/orders">Ver pedidos</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Ventas del mes" value={formatCurrency(data.monthlySales)} description={`${data.orderCount} pedidos creados`} icon={<DollarSign />} />
        <MetricCard title="Cotizado del mes" value={formatCurrency(data.monthlyQuotes)} description={`${data.quoteCount} cotizaciones emitidas`} icon={<FileText />} />
        <MetricCard title="Cobrado del mes" value={formatCurrency(data.collected)} description={`${data.paymentCount} pagos registrados`} icon={<CheckCircle2 />} />
        <MetricCard title="Por cobrar" value={formatCurrency(data.outstanding)} description={`${data.pendingInvoiceCount} facturas pendientes`} icon={<Receipt />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Clientes con mayor venta</CardTitle>
            <CardDescription>Prioriza seguimiento comercial y recompra.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topCustomers.length === 0 ? (
              <EmptyState icon={<Users className="h-8 w-8" />} title="Aun no hay ventas" actionHref="/orders/new" actionText="Crear pedido" />
            ) : (
              <div className="space-y-4">
                {data.topCustomers.map((customer) => (
                  <div key={customer.customerId} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-primary-900">{customer.name}</p>
                        <p className="text-sm text-primary-500">{customer.orders} pedidos</p>
                      </div>
                      <p className="font-bold text-primary-900">{formatCurrency(customer.total)}</p>
                    </div>
                    <div className="h-2 rounded-full bg-primary-100">
                      <div
                        className="h-2 rounded-full bg-action-600"
                        style={{ width: `${Math.max(8, (customer.total / maxCustomerTotal) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion comercial</CardTitle>
            <CardDescription>Cotizaciones aprobadas contra total historico.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-action-600 bg-action-50">
                <span className="text-2xl font-bold text-action-700">{data.conversionRate}%</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-primary-500">Ticket promedio del mes</p>
                  <p className="text-xl font-bold text-primary-900">{formatCurrency(data.averageOrder)}</p>
                </div>
                <Badge variant={data.conversionRate >= 35 ? 'success' : 'warning'}>
                  {data.conversionRate >= 35 ? 'Buen ritmo' : 'Requiere seguimiento'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cobranza pendiente</CardTitle>
            <CardDescription>Facturas que conviene revisar primero.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentInvoices.length === 0 ? (
              <EmptyState icon={<Receipt className="h-8 w-8" />} title="No hay facturas pendientes" actionHref="/billing" actionText="Ver facturacion" />
            ) : (
              <div className="space-y-3">
                {data.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-primary-200 p-4">
                    <div>
                      <p className="font-semibold text-primary-900">{invoice.concept}</p>
                      <p className="text-sm text-primary-500">Vence: {formatShortDate(invoice.dueAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-900">{formatCurrency(invoice.amountMxn)}</p>
                      <Badge variant={invoice.status === 'expired' ? 'destructive' : 'warning'} size="sm">
                        {invoice.status === 'expired' ? 'Vencida' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario critico</CardTitle>
            <CardDescription>Productos en minimo o por debajo del minimo.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockItems.length === 0 ? (
              <EmptyState icon={<Package className="h-8 w-8" />} title="Inventario sin alertas" actionHref="/inventory" actionText="Ver inventario" />
            ) : (
              <div className="space-y-3">
                {data.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-warning-200 bg-warning-50 p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning-700" />
                      <div>
                        <p className="font-semibold text-primary-900">{item.name}</p>
                        <p className="text-sm text-primary-500">Minimo: {item.minimumStock}</p>
                      </div>
                    </div>
                    <Badge variant="warning">{item.stockQuantity} disponibles</Badge>
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

function MetricCard({ title, value, description, icon }: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="rounded-lg bg-action-100 p-2 text-action-700 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary-900">{value}</div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon, title, actionHref, actionText }: {
  icon: React.ReactNode
  title: string
  actionHref: string
  actionText: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary-300 py-10 text-center">
      <div className="mb-3 rounded-full bg-primary-100 p-3 text-primary-500">{icon}</div>
      <p className="mb-4 font-medium text-primary-900">{title}</p>
      <Button asChild variant="outline" size="sm">
        <Link href={actionHref}>
          {actionText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
