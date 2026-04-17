import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Eye
} from "lucide-react"
import Link from "next/link"

async function getLeads() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return leads
}

export default async function AdminLeadsPage() {
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Leads</h1>
          <p className="text-primary-500 mt-1">
            Gestiona los leads del SaaS
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo lead
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
              <Input
                placeholder="Buscar por nombre, empresa o email..."
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white text-sm text-primary-900 focus-visible:outline-none focus-visible:border-danger-600">
              <option value="">Todos los estados</option>
              <option value="new">Nuevos</option>
              <option value="contacted">Contactados</option>
              <option value="qualified">Calificados</option>
              <option value="closed">Cerrados</option>
              <option value="lost">Perdidos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-900">No hay leads</h3>
            <p className="text-primary-500 text-center max-w-md">
              Los leads aparecerán aquí cuando se capturen desde la landing page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead: any) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead }: { lead: any }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Lead Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 bg-danger-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-danger-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-primary-900">{lead.name}</h3>
                  <LeadStatusBadge status={lead.status} />
                </div>
                {lead.businessName && (
                  <div className="flex items-center gap-2 text-sm text-primary-500">
                    <Building2 className="h-4 w-4" />
                    <span>{lead.businessName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Phone className="h-4 w-4" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.city && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <MapPin className="h-4 w-4" />
                  <span>{lead.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-primary-600">
                <Calendar className="h-4 w-4" />
                <span>Registrado: {new Date(lead.createdAt).toLocaleDateString('es-MX')}</span>
              </div>
            </div>

            {/* Message */}
            {lead.message && (
              <div className="pt-4 border-t-2 border-primary-200">
                <p className="text-sm text-primary-700 bg-primary-50 p-3 rounded-lg">
                  {lead.message}
                </p>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="lg:w-64 space-y-4">
            {/* Business Type */}
            {lead.businessType && (
              <Card className="bg-primary-50">
                <CardContent className="p-4">
                  <p className="text-xs text-primary-500 mb-1">Tipo de negocio</p>
                  <p className="text-sm font-medium text-primary-900 capitalize">
                    {lead.businessType}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Source */}
            {lead.source && (
              <Card className="bg-primary-50">
                <CardContent className="p-4">
                  <p className="text-xs text-primary-500 mb-1">Fuente</p>
                  <p className="text-sm font-medium text-primary-900 capitalize">
                    {lead.source}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                <Link href={`/admin/leads/${lead.id}`}>
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

function LeadStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    new: { label: 'Nuevo', variant: 'info' as const, icon: <CheckCircle className="h-3 w-3" /> },
    contacted: { label: 'Contactado', variant: 'warning' as const, icon: <Clock className="h-3 w-3" /> },
    qualified: { label: 'Calificado', variant: 'success' as const, icon: <CheckCircle className="h-3 w-3" /> },
    closed: { label: 'Cerrado', variant: 'secondary' as const, icon: <CheckCircle className="h-3 w-3" /> },
    lost: { label: 'Perdido', variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" /> },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: null }

  return (
    <Badge variant={config.variant} className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  )
}
