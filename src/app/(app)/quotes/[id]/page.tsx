import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to avoid database errors during build
export const dynamic = 'force-dynamic'

async function getQuote(id: string) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const quote = await prisma.quote.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          }
        }
      }
    })

    return quote
  } catch (error) {
    console.error('Error fetching quote:', error)
    return null
  }
}

export default async function QuoteDetailsPage({ params }: { params: { id: string } }) {
  const quote = await getQuote(params.id)

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Cotización no encontrada</h2>
              <p className="text-muted-foreground mb-4">
                La cotización que buscas no existe o no tienes acceso a ella.
              </p>
              <Button asChild>
                <Link href="/quotes">Volver a cotizaciones</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: Edit },
    sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-800', icon: Send },
    accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: XCircle },
  }

  const config = statusConfig[quote.status as keyof typeof statusConfig] || { label: quote.status, color: 'bg-gray-100 text-gray-800', icon: Edit }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/quotes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Cotización #{quote.id.slice(-6)}</h1>
            <p className="text-muted-foreground">
              {quote.customer.businessName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/billing">
                <FileText className="h-4 w-4 mr-2" />
                Ver facturación
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quotes/${quote.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/new?quoteId=${quote.id}`}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Convertir a pedido
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la cotización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                    <config.icon className="h-4 w-4 mr-1" />
                    {config.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de creación</span>
                  <span className="font-medium">
                    {new Date(quote.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
                {quote.validUntil && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Válida hasta</span>
                    <span className="font-medium">
                      {new Date(quote.validUntil).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {item.quantity} × ${item.unitPrice.toLocaleString('es-MX')}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${item.amount.toLocaleString('es-MX')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${quote.total.toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (16%)</span>
                  <span className="font-medium">
                    ${(quote.total * 0.16).toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl">
                      ${(quote.total * 1.16).toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/quotes/${quote.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar cotización
                  </Link>
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/orders/new?quoteId=${quote.id}`}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Convertir a pedido
                  </Link>
                </Button>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  asChild
                >
                  <Link href={`/quotes/${quote.id}/delete`}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar cotización
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
