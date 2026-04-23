import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Search, CheckCircle, Clock, AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

async function getContactMessages() {
  return await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export default async function ContactMessagesPage() {
  const messages = await getContactMessages()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      case 'replied':
        return <Mail className="h-4 w-4 text-action-600" />
      default:
        return <Clock className="h-4 w-4 text-warning-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'read':
        return <Badge className="bg-success-600">Leído</Badge>
      case 'replied':
        return <Badge className="bg-action-600">Respondido</Badge>
      default:
        return <Badge className="bg-warning-600">Nuevo</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-900">Mensajes de Contacto</h1>
        <p className="text-muted-foreground">
          Mensajes recibidos desde el formulario de contacto
        </p>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar mensajes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-primary-300 bg-white"
          />
        </div>
        <select className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white">
          <option value="">Todos los estados</option>
          <option value="new">Nuevos</option>
          <option value="read">Leídos</option>
          <option value="replied">Respondidos</option>
        </select>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay mensajes de contacto</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">{message.name}</CardTitle>
                  <CardDescription>{message.email}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(message.status)}
                  {getStatusBadge(message.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-primary-900 mb-2">{message.subject}</p>
                <p className="text-sm text-muted-foreground">{message.message}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  {new Date(message.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}