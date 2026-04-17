"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  FileText, 
  DollarSign, 
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Shield
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Empresas', href: '/admin/companies', icon: Building2 },
  { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Facturas', href: '/admin/invoices', icon: FileText },
  { name: 'Pagos', href: '/admin/payments', icon: DollarSign },
  { name: 'Leads', href: '/admin/leads', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
            <div className="h-10 w-10 bg-danger-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary-900">CotizaNet</h1>
              <p className="text-xs text-primary-500">Panel Admin</p>
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
                      ? 'bg-danger-600 text-white shadow-md' 
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
              <div className="h-10 w-10 bg-danger-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-danger-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-primary-900">Administrador</p>
                <p className="text-xs text-primary-500 truncate">admin@cotizanet.com</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-primary-700 hover:text-danger-600 hover:bg-danger-50"
              asChild
            >
              <a href="/api/auth/logout">
                <LogOut className="h-4 w-4 mr-3" />
                Cerrar sesión
              </a>
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
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 w-64 rounded-lg border-2 border-primary-300 bg-white text-sm text-primary-900 focus-visible:outline-none focus-visible:border-danger-600 focus-visible:ring-2 focus-visible:ring-danger-600/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-primary-700 hover:bg-primary-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger-600 rounded-full" />
              </Button>
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l-2 border-primary-200">
                <div className="h-9 w-9 bg-danger-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-danger-700" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-900">Admin</p>
                  <p className="text-xs text-primary-500">admin@cotizanet.com</p>
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
