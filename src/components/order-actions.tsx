"use client"

import { Button } from "@/components/ui/button"
import { Printer, FileText, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface OrderActionsProps {
  orderId: string
  orderStatus: string
}

export default function OrderActions({ orderId, orderStatus }: OrderActionsProps) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const handleGenerateInvoice = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        // Redirect to billing page with success message
        router.push('/billing?success=invoice_created')
      } else {
        const data = await response.json()
        // Show error toast or notification (implement toast library later)
        console.error('Error al generar factura:', data.error)
        alert(data.error || 'Error al generar factura')
      }
    } catch (error) {
      console.error('Error al generar factura:', error)
      alert('Error al generar factura')
    }
  }

  return (
    <div className="flex gap-2 no-print">
      <Button
        variant="outline"
        className="gap-2"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
      <Button
        variant="outline"
        className="gap-2"
        disabled={orderStatus !== 'delivered'}
        onClick={handleGenerateInvoice}
      >
        <FileText className="h-4 w-4" />
        Generar Factura
      </Button>
      <Button variant="outline" className="gap-2" asChild>
        <Link href={`/orders/${orderId}/edit`}>
          <Edit className="h-4 w-4" />
          Editar
        </Link>
      </Button>
    </div>
  )
}
