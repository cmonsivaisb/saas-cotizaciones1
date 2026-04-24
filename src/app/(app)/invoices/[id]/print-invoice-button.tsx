"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import Link from "next/link"

export default function PrintInvoiceButton({ invoiceId }: { invoiceId: string }) {
  return (
    <Button variant="outline" size="sm" className="gap-2" asChild>
      <Link href={`/api/invoices/${invoiceId}/pdf`}>
        <Printer className="h-4 w-4" />
        Descargar PDF
      </Link>
    </Button>
  )
}