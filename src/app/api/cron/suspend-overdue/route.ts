import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    // Find subscriptions in grace period that have expired
    const subscriptionsToSuspend = await prisma.subscription.findMany({
      where: {
        status: 'grace_period',
        graceUntil: {
          lte: now,
        },
      },
      include: {
        company: true,
        invoices: {
          where: {
            status: 'pending',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    let suspendedCount = 0
    const errors: string[] = []

    for (const subscription of subscriptionsToSuspend) {
      try {
        // Check if there are still pending invoices
        const hasPendingInvoices = subscription.invoices.some(inv => inv.status === 'pending')

        if (hasPendingInvoices) {
          // Suspend the subscription
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'suspended',
              suspendedAt: now,
            },
          })

          // Suspend the company
          await prisma.company.update({
            where: { id: subscription.companyId },
            data: {
              status: 'suspended',
            },
          })

          suspendedCount++
        }
      } catch (error) {
        console.error(`Error suspending subscription ${subscription.id}:`, error)
        errors.push(`Subscription ${subscription.id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      suspendedCount,
      totalProcessed: subscriptionsToSuspend.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Error in suspend overdue cron:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
