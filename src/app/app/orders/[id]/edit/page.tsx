"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { AlertError } from "@/components/alert-message"

interface OrderItem {
  id: string
  description: string
  qty: number
  unitPrice: number
  amount: number
}

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)

  const [customers, setCustomers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    customerId: "",
    dueDate: "",
    notes: "",
    status: "pending",
    total: 0,
  })
  
  const [items, setItems] = useState<OrderItem[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderRes, customersRes] = await Promise.all([
          fetch(`/api/orders/${params.id}`),
          fetch('/api/clients'),
        ])
        
        if (orderRes.status === 404) {
          setNotFound(true)
        } else if (orderRes.ok) {
          const order = await orderRes.json()
          setFormData({
            customerId: order.customerId,
            dueDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
            notes: order.notes || '',
            status: order.status,
            total: order.total || 0,
          })
          setItems(order.items || [])
        } else if (orderRes.status === 401) {
          router.push('/login')
          return
        } else {
          setError('Error al cargar el pedido')
        }
        
        if (customersRes.ok) {
          const customersData = await customersRes.json()
          setCustomers(customersData)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error de conexión. Intenta nuevamente.')
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al actualizar orden")
        setLoading(false)
        return
      }

      router.push(`/orders/${params.id}`)
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (fetching) {
    return <div className="flex items-center justify-center min-h-screen"><p>Cargando...</p></div>
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Pedido no encontrado</h1>
          <p className="text-muted-foreground mb-6">El pedido que buscas no existe o fue eliminado.</p>
          <Button asChild>
            <Link href="/orders">Volver a pedidos</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (error && !formData.customerId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/orders">Volver a pedidos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/orders/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Editar pedido</h1>
            <p className="text-muted-foreground">
              Modifica los detalles del pedido
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit}>
          {error && <AlertError message={error} />}

          <div className="space-y-6">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
                <CardDescription>Selecciona el cliente para este pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="customerId">Cliente *</Label>
                  <select
                    id="customerId"
                    name="customerId"
                    required
                    value={formData.customerId}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.businessName}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del pedido</CardTitle>
                <CardDescription>Estado y notas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En proceso</option>
                      <option value="partial_delivered">Entrega parcial</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de entrega</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      placeholder="Notas adicionales..."
                      value={formData.notes}
                      onChange={handleChange}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items - Read only */}
            <Card>
              <CardHeader>
                <CardTitle>Artículos</CardTitle>
                <CardDescription>Los artículos del pedido no pueden ser modificados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.qty} x ${item.unitPrice.toLocaleString('es-MX')}
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

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href={`/orders/${params.id}`}>Cancelar</Link>
              </Button>
              <div className="flex-1" />
              <Button 
                type="submit" 
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
