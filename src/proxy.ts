import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/pricing',
  '/demo',
  '/contact',
  '/login',
  '/register',
  '/terms',
  '/privacy',
  '/api/leads',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/webhooks/mercadopago',
  '/api/cron/billing-cycle',
  '/api/cron/suspend-overdue',
]

// Routes that require admin role
const adminRoutes = [
  '/admin',
]

// Routes that are allowed even when subscription is suspended
const allowedWhenSuspended = [
  '/billing',
  '/billing/locked',
  '/help',
  '/subscription',
  '/settings',
  '/api/billing',
  '/api/billing/pay',
  '/api/billing/return',
  '/api/billing/return/success',
  '/api/billing/return/failure',
  '/api/billing/return/pending',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get session from cookie
  const session = request.cookies.get('session')?.value

  if (!session) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Parse session
    const sessionData = JSON.parse(session)
    const { userId, role, companyId, subscriptionStatus } = sessionData

    // Check if route requires admin role
    const isAdminRoute = adminRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check subscription status for non-admin routes
    const isSuspended = subscriptionStatus === 'suspended'
    const isAllowedWhenSuspended = allowedWhenSuspended.some(route => 
      pathname.startsWith(route)
    )

    if (isSuspended && !isAllowedWhenSuspended && !isAdminRoute) {
      return NextResponse.redirect(new URL('/billing/locked', request.url))
    }

    // Add user info to headers for use in server components
    const response = NextResponse.next()
    response.headers.set('x-user-id', userId)
    response.headers.set('x-user-role', role)
    response.headers.set('x-company-id', companyId || '')
    response.headers.set('x-subscription-status', subscriptionStatus || '')

    return response
  } catch (error) {
    // Invalid session, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)',
  ],
}
