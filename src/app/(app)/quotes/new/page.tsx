"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, Trash2, Send } from "lucide-react"
import Link from "next/link"
import { QuoteLifecycleGuide } from "@/components/quote-lifecycle-guide"

interface QuoteItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  [key: string]: any
}

export default function NewQuotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    customerId: "",
    reference: "",
    notes: "",
    validUntil: "",
  })
  
  const [items, setItems] = useState<QuoteItem[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, productsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/products'),
        ])
        
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          setClients(clientsData)
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [])

  const addItem = () => {
    setItems([...items, {
      productId: "",
      productName: "",
      quantity: 1,
      price: 0,
      total: 0,
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    
    // Recalculate total if quantity or price changed
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price
    }
    
    // Update product name if product selected
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].productName = product.name
        newItems[index].description = product.name
        newItems[index].price = product.salePrice
        newItems[index].total = newItems[index].quantity * product.salePrice
      }
    }
    
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = async (e: React.FormEvent, send = false) => {
    e.preventDefault()
    setError("")
    
    if (send) {
      setSending(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items,
          total: calculateTotal(),
          status: send ? 'sent' : 'draft',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear cotización")
        setLoading(false)
        setSending(false)
        return
      }

      router.push("/quotes")
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
      setSending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

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
          <div>
            <h1 className="text-3xl font-bold mb-2">Nueva cotización</h1>
            <p className="text-muted-foreground">
              Crea una cotización para un cliente
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <QuoteLifecycleGuide compact />
        <form onSubmit={(e) => handleSubmit(e, false)}>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
                <CardDescription>Selecciona el cliente para esta cotización</CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length === 0 && (
                  <div className="mb-4 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-900">
                    Primero necesitas registrar un cliente.{" "}
                    <Link href="/clients/new" className="font-semibold underline">
                      Crear cliente
                    </Link>
                  </div>
                )}
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
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.businessName}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Referencia</CardTitle>
                <CardDescription>Identificador rápido para esta cotización</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referencia</Label>
                  <Input
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    placeholder="Ej: Pedido urgente, cliente VIP..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quote Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Productos/Servicios</CardTitle>
                    <CardDescription>Agrega los items a cotizar</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 && (
                  <div className="mb-4 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-900">
                    Puedes cotizar capturando precio manual, pero es mas rapido si registras tus productos.{" "}
                    <Link href="/inventory/new" className="font-semibold underline">
                      Agregar producto
                    </Link>
                  </div>
                )}
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay items agregados</p>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar primer item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-4 items-start p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Producto/Servicio</Label>
                              <select
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="">Seleccionar...</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - ${product.salePrice}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label>Cantidad</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Precio unitario</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Subtotal</Label>
                              <Input
                                type="text"
                                value={`$${item.total.toLocaleString('es-MX')}`}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes and Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles adicionales</CardTitle>
                <CardDescription>Notas y vigencia de la cotización</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      placeholder="Notas adicionales para el cliente..."
                      value={formData.notes}
                      onChange={handleChange}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Válida hasta</Label>
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total de la cotización</span>
                  <span className="text-3xl font-bold">
                    ${calculateTotal().toLocaleString('es-MX')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/quotes">Cancelar</Link>
              </Button>
              <div className="flex-1" />
              <Button 
                type="button" 
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={sending || items.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Enviando..." : "Guardar y enviar"}
              </Button>
              <Button 
                type="submit" 
                disabled={loading || items.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar borrador"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
