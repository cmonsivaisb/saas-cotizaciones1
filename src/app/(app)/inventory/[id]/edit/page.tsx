"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    stock: "",
  })

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await response.json()
        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          sku: data.sku || "",
          stock: data.stock?.toString() || "",
        })
      } catch (err) {
        setError("Error al cargar el producto")
      }
    }
    fetchProduct()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al actualizar producto")
        setLoading(false)
        return
      }

      router.push("/inventory")
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")) {
      return
    }

    setDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Error al eliminar producto")
        setDeleting(false)
        return
      }

      router.push("/inventory")
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setDeleting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Editar producto</h1>
            <p className="text-muted-foreground">
              Actualiza la información del producto
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del producto</CardTitle>
            <CardDescription>
              Actualiza los datos del producto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Servicio de mantenimiento"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Descripción detallada del producto o servicio..."
                    value={formData.description}
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio unitario *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stock}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Código de producto)</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Ej: PROD-001"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/inventory">Cancelar</Link>
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Eliminando..." : "Eliminar"}
                </Button>
                <div className="flex-1" />
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
