"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    rfc: "",
    taxId: "",
  })

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clients/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch client')
        }
        const data = await response.json()
        setFormData({
          businessName: data.businessName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.source || "",
          rfc: data.rfc || data.notes || "",
          taxId: data.taxId || "",
        })
      } catch (err) {
        setError("Error al cargar el cliente")
      }
    }
    fetchClient()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al actualizar cliente")
        setLoading(false)
        return
      }

      router.push("/clients")
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      return
    }

    setDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Error al eliminar cliente")
        setDeleting(false)
        return
      }

      router.push("/clients")
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setDeleting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Editar cliente</h1>
            <p className="text-muted-foreground">
              Actualiza la información del cliente
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del cliente</CardTitle>
            <CardDescription>
              Actualiza los datos del cliente
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
                  <Label htmlFor="businessName">Nombre del cliente *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="Ej: Empresa ABC S.A. de C.V."
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="cliente@empresa.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Calle, número, colonia, ciudad, estado, CP"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      name="rfc"
                      placeholder="RFC del cliente"
                      value={formData.rfc}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">ID Fiscal</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      placeholder="ID fiscal (opcional)"
                      value={formData.taxId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/clients">Cancelar</Link>
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
