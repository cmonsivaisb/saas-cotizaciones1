"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { AlertError } from "@/components/alert-message"

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  [key: string]: any
}

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    customerId: "",
    quoteId: "",
    dueDate: "",
    notes: "",
  })
  
  const [items, setItems] = useState<OrderItem[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [customersRes, productsRes, quotesRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/products'),
          fetch('/api/quotes'),
        ])
        
        if (customersRes.ok) {
          const customersData = await customersRes.json()
          setCustomers(customersData)
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
        
        if (quotesRes.ok) {
          const quotesData = await quotesRes.json()
          setQuotes(quotesData.filter((q: any) => q.status === 'approved' || q.status === 'sent' || q.status === 'follow_up'))
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

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
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
        newItems[index].price = product.salePrice
        newItems[index].total = newItems[index].quantity * product.salePrice
      }
    }
    
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const handleQuoteChange = async (quoteId: string) => {
    setFormData({ ...formData, quoteId })
    
    if (!quoteId) return
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}`)
      if (response.ok) {
        const quote = await response.json()
        // Load items from quote
        const quoteItems = quote.items.map((item: any) => ({
          productId: item.itemId || "",
          productName: item.description,
          quantity: item.qty,
          price: item.unitPrice,
          total: item.amount,
        }))
        setItems(quoteItems)
      }
    } catch (err) {
      console.error('Error loading quote:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: formData.customerId,
          quoteId: formData.quoteId,
          items,
          total: calculateTotal(),
          notes: formData.notes,
          deliveryDate: formData.dueDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear orden")
        setLoading(false)
        return
      }

      router.push("/orders")
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Nueva orden</h1>
            <p className="text-muted-foreground">
              Crea una orden de venta para un cliente
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit}>
          {error && <AlertError message={error} />}

          <div className="space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
                <CardDescription>Selecciona el cliente para esta orden</CardDescription>
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

            {/* Quote Selection (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle>Cotización (opcional)</CardTitle>
                <CardDescription>Selecciona una cotización para cargar sus items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="quoteId">Cotización</Label>
                  <select
                    id="quoteId"
                    name="quoteId"
                    value={formData.quoteId}
                    onChange={(e) => handleQuoteChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccionar cotización...</option>
                    {quotes.map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        {quote.folio} - {quote.customer?.businessName} - ${quote.total.toLocaleString('es-MX')}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Productos/Servicios</CardTitle>
                    <CardDescription>Agrega los items a la orden</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                <CardDescription>Notas y fecha de entrega</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      placeholder="Notas adicionales para la orden..."
                      value={formData.notes}
                      onChange={handleChange}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
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
                </div>
              </CardContent>
            </Card>

            {/* Total */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total de la orden</span>
                  <span className="text-3xl font-bold">
                    ${calculateTotal().toLocaleString('es-MX')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/orders">Cancelar</Link>
              </Button>
              <div className="flex-1" />
              <Button 
                type="submit" 
                disabled={loading || items.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Crear orden"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
