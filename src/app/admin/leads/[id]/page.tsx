import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Phone, Mail, Calendar, ArrowLeft, Edit, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getLead(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
  })
  return lead
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const lead = await getLead(id)

  if (!lead) {
    notFound()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4 text-warning-600" />
      case 'contacted':
        return <CheckCircle className="h-4 w-4 text-action-600" />
      case 'converted':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      case 'lost':
        return <XCircle className="h-4 w-4 text-danger-600" />
      default:
        return <Clock className="h-4 w-4 text-warning-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-warning-600',
      contacted: 'bg-action-600',
      converted: 'bg-success-600',
      lost: 'bg-danger-600',
    }
    const labels: Record<string, string> = {
      new: 'Nuevo',
      contacted: 'Contactado',
      converted: 'Convertido',
      lost: 'Perdido',
    }
    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/admin/leads"
          className="flex items-center gap-2 text-primary-700 hover:text-primary-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Leads
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{lead.name}</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(lead.status)}
                {getStatusBadge(lead.status)}
              </div>
            </CardTitle>
            <CardDescription>{lead.businessName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-primary-700">
              <Building2 className="h-4 w-4" />
              <span>{lead.businessType}</span>
            </div>
            <div className="flex items-center gap-3 text-primary-700">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${lead.email}`} className="hover:text-action-600">
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-primary-700">
              <Phone className="h-4 w-4" />
              <a href={`tel:${lead.phone}`} className="hover:text-action-600">
                {lead.phone}
              </a>
            </div>
            <div className="flex items-center gap-3 text-primary-700">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(lead.createdAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-primary-700 whitespace-pre-wrap">
              {lead.message || 'Sin mensaje'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Actualizar Estado</CardTitle>
            <CardDescription>Cambia el estado del lead</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-4">
              <select 
                name="status" 
                defaultValue={lead.status}
                className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white"
              >
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="converted">Convertido</option>
                <option value="lost">Perdido</option>
              </select>
              <Button type="submit" variant="default">
                Actualizar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}