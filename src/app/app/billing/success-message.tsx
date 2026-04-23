'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessMessage() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const router = useRouter()

  useEffect(() => {
    if (success === 'invoice_created') {
      // Scroll to top and show visual feedback
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [success])

  if (!success) return null

  const handleClose = () => {
    router.push('/billing')
  }

  return (
    <Card className="border-success-200 bg-success-50">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-success-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-success-900">¡Factura generada exitosamente!</h3>
          <p className="text-sm text-success-700">
            La factura ha sido creada y puedes verla en esta lista.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          Cerrar
        </Button>
      </CardContent>
    </Card>
  )
}
