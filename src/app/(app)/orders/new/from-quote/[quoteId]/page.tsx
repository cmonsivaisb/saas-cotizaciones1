"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { AlertError } from "@/components/alert-message"

export default function NewOrderFromQuotePage({ params }: { params: Promise<{ quoteId: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [initialLoading, setInitialLoading] = useState(true)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [formData, setFormData] = useState({ dueDate: "", notes: "" })
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    async function loadQuote() {
      try {
        const { quoteId } = await params
        const quoteRes = await fetch(`/api/quotes/${quoteId}`)
        
        if (quoteRes.ok) {
          const quote = await quoteRes.json()
          setQuoteData(quote)
          setItems(quote.items.map((item: any) => ({
            productId: item.itemId || "",
            productName: item.item?.name || item.description || "Producto",
            quantity: item.qty,
            price: item.unitPrice,
            total: item.amount,
          })))
        }
        
        const productsRes = await fetch('/api/products')
        if (productsRes.ok) {
          setProducts(await productsRes.json())
        }
      } catch (err) {
        console.error('Error loading quote:', err)
        setError('Error al cargar la cotización')
      } finally {
        setInitialLoading(false)
      }
    }
    loadQuote()
  }, [params])

  const addItem = () => {
    setItems([...items, { productId: "", productName: "", quantity: 1, price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_: any, i: number) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].productName = product.name
        newItems[index].price = product.salePrice
        newItems[index].total = newItems[index].quantity * product.salePrice
      }
    }
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price
    }
    setItems(newItems)
  }

  const calculateTotal = () => items.reduce((sum, item) => sum + item.total, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: quoteData?.customerId,
          quoteId: quoteData?.id,
          items: items.map(item => ({
            productId: item.productId || null,
            description: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          total: calculateTotal(),
          notes: formData.notes,
          deliveryDate: formData.dueDate,
        }),
      })

      if (response.ok) router.push("/orders")
      else { setError("Error al crear pedido"); setLoading(false) }
    } catch (err) { setError("Error de conexión"); setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (initialLoading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2"></div></div>
  if (!quoteData) return <div className="p-10"><h2>Cotización no encontrada</h2><Link href="/quotes">Volver</Link></div>

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" asChild><Link href={`/quotes/${quoteData.id}`}><ArrowLeft /></Link></Button>
        <div><h1 className="text-2xl font-bold">Crear pedido</h1><p className="text-muted-foreground">Desde cotización #{quoteData.id.slice(-6)}</p></div>
      </div>
      {error && <AlertError message={error} />}
      <Card className="mb-6"><CardHeader><CardTitle>Cliente</CardTitle></CardHeader><CardContent><p className="font-medium">{quoteData.customer?.businessName}</p></CardContent></Card>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Productos</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? <p className="text-muted-foreground">Sin productos</p> : items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} className="w-full h-10 rounded border px-2">
                  <option value="">Seleccionar producto...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.salePrice}</option>)}
                </select>
              </div>
              <div className="w-20"><Input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', +e.target.value)} /></div>
              <div className="w-24"><Input type="number" step="0.01" value={item.price} onChange={e => updateItem(i, 'price', +e.target.value)} /></div>
              <div className="w-28 text-right font-medium">${item.total.toLocaleString()}</div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="mb-6"><CardHeader><CardTitle>Notas y entrega</CardTitle></CardHeader><CardContent className="space-y-4">
        <textarea name="notes" rows={2} placeholder="Notas..." value={formData.notes} onChange={handleChange} className="w-full rounded border p-2" />
        <Input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
      </CardContent></Card>
      <Card className="mb-6"><CardContent className="pt-6"><div className="flex justify-between text-xl font-bold"><span>Total</span><span>${calculateTotal().toLocaleString()}</span></div></CardContent></Card>
      <div className="flex gap-4">
        <Button variant="outline" asChild><Link href="/orders">Cancelar</Link></Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={loading || items.length === 0}><Save className="mr-2" />{loading ? "Guardando..." : "Crear pedido"}</Button>
      </div>
    </div>
  )
}