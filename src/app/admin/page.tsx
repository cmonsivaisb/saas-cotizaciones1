import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  CreditCard,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getAdminDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get counts
  const [
    totalCompanies,
    activeCompanies,
    gracePeriodCompanies,
    suspendedCompanies,
    totalSubscriptions,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    totalLeads,
    newLeads,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: 'active' } }),
    prisma.company.count({ where: { status: 'grace_period' } }),
    prisma.company.count({ where: { status: 'suspended' } }),
    prisma.subscription.count(),
    prisma.subscriptionInvoice.count(),
    prisma.subscriptionInvoice.count({ where: { status: 'paid' } }),
    prisma.subscriptionInvoice.count({ where: { status: 'pending' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'new' } }),
  ])

  // Get revenue this month
  const monthlyRevenue = await prisma.subscriptionInvoice.aggregate({
    where: {
      status: 'paid',
      paidAt: {
        gte: startOfMonth,
      },
    },
    _sum: {
      amountMxn: true,
    },
  })

  // Get recent companies
  const recentCompanies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  })

  // Get recent leads
  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return {
    totalCompanies,
    activeCompanies,
    gracePeriodCompanies,
    suspendedCompanies,
    totalSubscriptions,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    totalLeads,
    newLeads,
    monthlyRevenue: monthlyRevenue._sum.amountMxn || 0,
    recentCompanies,
    recentLeads,
  }
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-900">Dashboard Admin</h1>
        <p className="text-primary-500 mt-1">
          Visión general del SaaS
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Empresas totales"
          value={data.totalCompanies}
          icon={<Building2 className="h-5 w-5" />}
          description={`${data.activeCompanies} activas`}
          trend="+12% este mes"
          trendUp={true}
        />
        <StatCard
          title="Suscripciones"
          value={data.totalSubscriptions}
          icon={<CreditCard className="h-5 w-5" />}
          description={`${data.gracePeriodCompanies} en gracia`}
          trend="+8% este mes"
          trendUp={true}
        />
        <StatCard
          title="Ingresos del mes"
          value={`$${data.monthlyRevenue.toLocaleString('es-MX')}`}
          icon={<DollarSign className="h-5 w-5" />}
          description={`${data.paidInvoices} facturas pagadas`}
          trend="+15% vs mes anterior"
          trendUp={true}
        />
        <StatCard
          title="Leads nuevos"
          value={data.newLeads}
          icon={<Users className="h-5 w-5" />}
          description={`${data.totalLeads} totales`}
          trend="+20% este mes"
          trendUp={true}
        />
      </div>

      {/* Company Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              Empresas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success-600 mb-2">
              {data.activeCompanies}
            </div>
            <p className="text-sm text-primary-500">
              Operando normalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning-600" />
              Período de Gracia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-warning-600 mb-2">
              {data.gracePeriodCompanies}
            </div>
            <p className="text-sm text-primary-500">
              5 días para pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
              Suspendidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-danger-600 mb-2">
              {data.suspendedCompanies}
            </div>
            <p className="text-sm text-primary-500">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas recientes</CardTitle>
            <CardDescription>Últimas 5 empresas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentCompanies.length === 0 ? (
              <div className="text-center py-8 text-primary-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No hay empresas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentCompanies.map((company: any) => (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-primary-900">{company.name}</p>
                      <p className="text-xs text-primary-500">
                        {company.email}
                      </p>
                    </div>
                    <CompanyStatusBadge status={company.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Leads recientes</CardTitle>
            <CardDescription>Últimos 5 leads capturados</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentLeads.length === 0 ? (
              <div className="text-center py-8 text-primary-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No hay leads registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-primary-900">{lead.name}</p>
                      <p className="text-xs text-primary-500">
                        {lead.businessName}
                      </p>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Invoices Alert */}
      {data.pendingInvoices > 0 && (
        <Card className="border-warning-200 bg-warning-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning-900 mb-1">
                  {data.pendingInvoices} facturas pendientes de pago
                </h3>
                <p className="text-sm text-warning-700">
                  Revisa las facturas pendientes y contacta a las empresas en período de gracia.
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-warning-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, description, trend, trendUp }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  description: string,
  trend?: string,
  trendUp?: boolean
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-danger-100 rounded-lg flex items-center justify-center text-danger-600">
            {icon}
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-primary-900">{title}</CardTitle>
            <CardDescription className="text-xs text-primary-500">{description}</CardDescription>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success-600' : 'text-danger-600'}`}>
            {trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
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

function CompanyStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Activa', variant: 'success' as const },
    grace_period: { label: 'Gracia', variant: 'warning' as const },
    suspended: { label: 'Suspendida', variant: 'destructive' as const },
    cancelled: { label: 'Cancelada', variant: 'secondary' as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

function LeadStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    new: { label: 'Nuevo', variant: 'info' as const },
    contacted: { label: 'Contactado', variant: 'warning' as const },
    qualified: { label: 'Calificado', variant: 'success' as const },
    closed: { label: 'Cerrado', variant: 'secondary' as const },
    lost: { label: 'Perdido', variant: 'destructive' as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
