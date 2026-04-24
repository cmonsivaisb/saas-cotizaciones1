"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, FileDown } from "lucide-react"

interface PrintButtonProps {
  type: "quote" | "order"
  id: string
  label?: string
}

export default function PrintButton({ type, id, label = "Imprimir" }: PrintButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePrint = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/${type === 'quote' ? 'quotes' : 'orders'}/${id}/print`)
      if (!response.ok) throw new Error('Error fetching data')
      
      const text = await response.text()
      const div = document.createElement('div')
      div.innerHTML = text
      div.style.position = 'absolute'
      div.style.left = '-9999px'
      document.body.appendChild(div)
      
      window.print()
      
      setTimeout(() => {
        document.body.removeChild(div)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint} disabled={loading}>
      {loading ? (
        <span className="animate-spin h-4 w-4">⏳</span>
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span className="ml-2">{loading ? 'Preparando...' : label}</span>
    </Button>
  )
}