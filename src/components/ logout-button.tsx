"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-primary-700 hover:text-danger-600 hover:bg-danger-50"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="h-4 w-4 mr-3" />
      {loading ? 'Cerrando...' : 'Cerrar sesión'}
    </Button>
  )
}