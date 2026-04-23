"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"

export default function InvoicePayButton({ invoiceId }: { invoiceId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo iniciar el pago')
      }

      if (!data?.checkoutUrl) {
        throw new Error('No se pudo obtener la URL de pago')
      }

      window.location.href = data.checkoutUrl
    } catch (err) {
      console.error('Error starting payment:', err)
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar el pago')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handlePay}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
        {isLoading ? 'Redirigiendo...' : 'Pagar'}
      </Button>
      {error && (
        <p className="text-xs text-danger-600">{error}</p>
      )}
    </div>
  )
}
