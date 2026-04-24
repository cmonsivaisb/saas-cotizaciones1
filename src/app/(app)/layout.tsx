"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  CreditCard
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Cotizaciones', href: '/quotes', icon: FileText },
  { name: 'Pedidos', href: '/orders', icon: Package },
  { name: 'Facturación', href: '/billing', icon: DollarSign },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Suscripción', href: '/subscription', icon: CreditCard },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

const allowedWhenSuspended = ['/billing', '/billing/locked', '/subscription', '/settings']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUserData({ name: data.name, email: data.email })
        }
      } catch (e) {}
    }
    fetchUser()
  }, [])

  useEffect(() => {
    let cancelled = false

    const syncSubscriptionAccess = async () => {
      try {
        const response = await fetch('/api/billing', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok || cancelled) {
          return
        }

        const billingData = await response.json()
        const isSuspended = billingData?.subscription?.status === 'suspended'
        const isAllowed = allowedWhenSuspended.some(
          (route) => pathname === route || pathname.startsWith(route + '/')
        )

        if (isSuspended && !isAllowed) {
          router.replace('/billing/locked')
          return
        }

        if (!isSuspended && pathname.startsWith('/billing/locked')) {
          router.replace('/subscription')
        }
      } catch (error) {
        console.error('Error syncing subscription access:', error)
      }
    }

    syncSubscriptionAccess()

    return () => {
      cancelled = true
    }
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const displayName = userData?.name || 'Usuario'
  const displayEmail = userData?.email || ''

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary-900/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white border-r-2 border-primary-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b-2 border-primary-200">
            <div className="h-10 w-10 bg-action-600 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary-900">CotizaNet</h1>
              <p className="text-xs text-primary-500">Gestión para PyMEs</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-action-600 text-white shadow-md' 
                      : 'text-primary-700 hover:bg-primary-100'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto opacity-70" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t-2 border-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-primary-900">{displayName}</p>
                <p className="text-xs text-primary-500 truncate">{displayEmail}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-primary-700 hover:text-danger-600 hover:bg-danger-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b-2 border-primary-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>              
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-primary-700 hover:bg-primary-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger-600 rounded-full" />
              </Button>
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l-2 border-primary-200">
                <div className="h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-700" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-900">{displayName}</p>
                  <p className="text-xs text-primary-500">{displayEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-73px)]">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}