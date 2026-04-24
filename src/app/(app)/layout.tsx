"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
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
  CreditCard,
  Check,
  CheckCheck,
  FileTextIcon,
  ShoppingCart,
  UserPlus,
  AlertTriangle
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

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  quote_created: <FileTextIcon className="h-4 w-4" />,
  quote_updated: <FileTextIcon className="h-4 w-4" />,
  quote_approved: <Check className="h-4 w-4" />,
  quote_rejected: <X className="h-4 w-4" />,
  order_created: <ShoppingCart className="h-4 w-4" />,
  order_updated: <ShoppingCart className="h-4 w-4" />,
  order_status_changed: <ShoppingCart className="h-4 w-4" />,
  order_delivered: <Check className="h-4 w-4" />,
  client_created: <UserPlus className="h-4 w-4" />,
  client_updated: <Users className="h-4 w-4" />,
  inventory_low_stock: <AlertTriangle className="h-4 w-4" />,
  default: <Bell className="h-4 w-4" />
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

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
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      } catch (e) {}
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (e) {}
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', notificationId }),
      })
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
      setShowNotifications(false)
    } catch (e) {}
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'ahora'
    if (minutes < 60) return `hace ${minutes}m`
    if (hours < 24) return `hace ${hours}h`
    return `hace ${days}d`
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
              {/* Notifications dropdown */}
              <div className="relative" ref={notificationRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-primary-700 hover:bg-primary-100"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-danger-600 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-primary-200 z-50">
                    <div className="p-4 border-b border-primary-200 flex items-center justify-between">
                      <h3 className="font-semibold text-primary-900">Notificaciones</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-action-600 hover:text-action-700 flex items-center gap-1"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Marcar todas leídas
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No hay notificaciones</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            href={notification.link || '#'}
                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                            className={`block p-4 border-b border-primary-100 hover:bg-primary-50 transition-colors ${
                              !notification.isRead ? 'bg-action-50/50' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                !notification.isRead ? 'bg-action-100 text-action-600' : 'bg-primary-100 text-primary-600'
                              }`}>
                                {notificationIcons[notification.type] || notificationIcons.default}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-medium truncate ${notification.isRead ? 'text-primary-700' : 'text-primary-900'}`}>
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-primary-500 whitespace-nowrap">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-primary-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="h-2 w-2 bg-action-600 rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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