"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CompanySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    bankName: "",
    bankAccount: "",
    clabe: "",
    paymentReference: "",
  })

  useEffect(() => {
    fetch('/api/companies/me')
      .then(res => {
        if (!res.ok) return null
        return res.json()
      })
      .then(data => {
        console.log('Company data:', data)
        if (data) {
          setCompany(data)
          setFormData({
            name: data.name || "",
            contactName: data.contactName || "",
            email: data.email || "",
            phone: data.phone || "",
            city: data.city || "",
            bankName: data.bankName || "",
            bankAccount: data.bankAccount || "",
            clabe: data.clabe || "",
            paymentReference: data.paymentReference || "",
          })
        }
      })
      .catch(err => console.error('Error:', err))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/companies/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        router.push('/settings?success=true')
      }
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  if (!company) return <div className="p-10">Cargando...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de la empresa</Label>
                <Input name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Nombre de contacto</Label>
                <Input name="contactName" value={formData.contactName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input name="city" value={formData.city} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información de pago (para facturas)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del banco</Label>
                <Input name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Banco XYZ" />
              </div>
              <div className="space-y-2">
                <Label>Número de cuenta</Label>
                <Input name="bankAccount" value={formData.bankAccount} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>CLABE</Label>
                <Input name="clabe" value={formData.clabe} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Referencia de pago</Label>
                <Input name="paymentReference" value={formData.paymentReference} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}