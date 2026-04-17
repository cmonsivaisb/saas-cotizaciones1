"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Building2, Mail, Phone, MapPin, FileText } from "lucide-react"
import Link from "next/link"

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    rfc: "",
    taxId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear cliente")
        setLoading(false)
        return
      }

      router.push("/clients")
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
          <p className="text-muted-foreground mt-1">
            Agrega un nuevo cliente a tu cartera
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>
            Completa los datos del cliente. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Información Básica</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre de la empresa *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Soluciones Tecnológicas S.A. de C.V."
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rfc">
                    RFC
                  </Label>
                  <Input
                    id="rfc"
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleChange}
                    placeholder="Ej: ABCD123456XYZ"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@empresa.com"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+52 55 1234 5678"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Dirección</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Dirección completa
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, número, colonia, ciudad, estado, código postal"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tax Information */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Información Fiscal</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">
                  ID Fiscal (Opcional)
                </Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="Número de identificación fiscal"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Guardando..." : "Guardar cliente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
