import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Users,
  FileText,
  Package,
  MoreVertical,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"

async function getCompanies() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          clients: true,
          quotes: true,
          orders: true,
        },
      },
    },
  })

  return companies
}

export default async function AdminCompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Empresas</h1>
          <p className="text-primary-500 mt-1">
            Gestiona las empresas del SaaS
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva empresa
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por nombre, email o contacto..."
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white text-sm text-primary-900 focus-visible:outline-none focus-visible:border-danger-600">
              <option value="">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="grace_period">Período de gracia</option>
              <option value="suspended">Suspendidas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay empresas registradas</h3>
            <p className="text-primary-500 text-center max-w-md mb-6">
              Las empresas aparecerán aquí cuando se registren en el sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {companies.map((company: any) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyCard({ company }: { company: any }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Company Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 bg-danger-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-danger-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-primary-900">{company.name}</h3>
                  <CompanyStatusBadge status={company.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-primary-500">
                  {company.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {company.contactName && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Users className="h-4 w-4" />
                  <span>Contacto: {company.contactName}</span>
                </div>
              )}
              {company.city && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <MapPin className="h-4 w-4" />
                  <span>{company.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-primary-600">
                <Calendar className="h-4 w-4" />
                <span>Registrado: {new Date(company.createdAt).toLocaleDateString('es-MX')}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-primary-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm font-semibold text-action-600">
                  <Users className="h-3 w-3" />
                  {company._count.clients}
                </div>
                <div className="text-xs text-primary-500">Clientes</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm font-semibold text-success-600">
                  <FileText className="h-3 w-3" />
                  {company._count.quotes}
                </div>
                <div className="text-xs text-primary-500">Cotizaciones</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm font-semibold text-primary-700">
                  <Package className="h-3 w-3" />
                  {company._count.orders}
                </div>
                <div className="text-xs text-primary-500">Pedidos</div>
              </div>
            </div>
          </div>

          {/* Right: Subscription & Actions */}
          <div className="lg:w-80 space-y-4">
            {/* Subscription Info */}
            {company.subscription && (
              <Card className="bg-primary-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Suscripción
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-500">Plan</span>
                    <span className="text-sm font-medium text-primary-900">
                      {company.subscription.plan.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-500">Estado</span>
                    <SubscriptionStatusBadge status={company.subscription.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-500">Próximo cobro</span>
                    <span className="text-xs font-medium text-primary-900">
                      {new Date(company.subscription.nextBillingAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                <Link href={`/admin/companies/${company.id}`}>
                  <Eye className="h-4 w-4" />
                  Ver detalle
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompanyStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Activa', variant: 'success' as const, icon: <CheckCircle className="h-3 w-3" /> },
    grace_period: { label: 'Gracia', variant: 'warning' as const, icon: <AlertTriangle className="h-3 w-3" /> },
    suspended: { label: 'Suspendida', variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" /> },
    cancelled: { label: 'Cancelada', variant: 'secondary' as const, icon: <XCircle className="h-3 w-3" /> },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: null }

  return (
    <Badge variant={config.variant} className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  )
}

function SubscriptionStatusBadge({ status }: { status: string }) {
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
