import { NextRequest, NextResponse } from 'next/server'
import { ERROR_MESSAGES } from '@/lib/errors'
import { cookies } from 'next/headers'
import { ensureCompanySubscription } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    // Ensure every company has an initial SaaS subscription record.
    const company = await ensureCompanySubscription(companyId)

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Calculate billing status
    const subscription = company.subscription
    let billingStatus = 'active'
    let daysUntilDue = 0
    let graceDaysRemaining = 0

    if (subscription) {
      const now = new Date()
      const nextBilling = new Date(subscription.nextBillingAt)
      const graceUntil = subscription.graceUntil ? new Date(subscription.graceUntil) : null

      if (subscription.status === 'suspended') {
        billingStatus = 'suspended'
      } else if (subscription.status === 'grace_period' && graceUntil) {
        billingStatus = 'grace_period'
        graceDaysRemaining = Math.ceil((graceUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      } else if (nextBilling < now) {
        billingStatus = 'overdue'
        daysUntilDue = Math.ceil((now.getTime() - nextBilling.getTime()) / (1000 * 60 * 60 * 24))
      } else {
        daysUntilDue = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    if (sessionData.subscriptionStatus !== (subscription?.status || undefined)) {
      const updatedSession = {
        ...sessionData,
        subscriptionStatus: subscription?.status,
      }

      cookieStore.set('session', JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        status: company.status,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextBillingAt: subscription.nextBillingAt,
        graceUntil: subscription.graceUntil,
        suspendedAt: subscription.suspendedAt,
      } : null,
      invoices: subscription?.subscriptionInvoices || [],
      billingStatus,
      daysUntilDue,
      graceDaysRemaining,
    })
  } catch (error) {
    console.error('Error fetching billing info:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
