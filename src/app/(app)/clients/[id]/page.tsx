"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, Users, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ClientDetailPage() {
  const params = useParams()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clients/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch client')
        }
        const data = await response.json()
        setClient(data)
      } catch (err) {
        setError("Error al cargar el cliente")
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div>
        <div className="mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Cliente no encontrado"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{client.businessName}</h1>
            <p className="text-muted-foreground">
              Información del cliente
            </p>
          </div>
          <Button asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.contactName && (
              <div>
                <p className="text-sm text-muted-foreground">Nombre de contacto</p>
                <p className="font-medium">{client.contactName}</p>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="hover:underline">
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${client.phone}`} className="hover:underline">
                  {client.phone}
                </a>
              </div>
            )}
            {client.source && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.source}</span>
              </div>
            )}
            {!client.email && !client.phone && !client.source && (
              <p className="text-muted-foreground text-sm">No hay datos de contacto registrados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información fiscal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.notes && (
              <div>
                <p className="text-sm text-muted-foreground">RFC</p>
                <p className="font-medium">{client.notes}</p>
              </div>
            )}
            {client.taxId && (
              <div>
                <p className="text-sm text-muted-foreground">ID Fiscal</p>
                <p className="font-medium">{client.taxId}</p>
              </div>
            )}
            {!client.notes && !client.taxId && (
              <p className="text-muted-foreground text-sm">No hay información fiscal registrada</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Actividad</CardTitle>
            <CardDescription>Resumen de la actividad del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{client._count?.quotes || 0}</span>
                <span className="text-muted-foreground">cotizaciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{client._count?.orders || 0}</span>
                <span className="text-muted-foreground">pedidos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}