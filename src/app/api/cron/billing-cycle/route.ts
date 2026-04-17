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

    // Find active subscriptions that need billing
    const subscriptionsToBill = await prisma.subscription.findMany({
      where: {
        status: 'active',
        nextBillingAt: {
          lte: now,
        },
      },
      include: {
        plan: true,
        company: true,
      },
    })

    let billedCount = 0
    const errors: string[] = []

    for (const subscription of subscriptionsToBill) {
      try {
        // Create new invoice
        const invoice = await prisma.invoice.create({
          data: {
            companyId: subscription.companyId,
            subscriptionId: subscription.id,
            concept: `Suscripción ${subscription.plan.name} - ${now.toLocaleDateString('es-MX')}`,
            amountMxn: subscription.plan.priceMxn,
            currency: 'MXN',
            status: 'pending',
            dueAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          },
        })

        // Create payment attempt (placeholder for Mercado Pago)
        const paymentAttempt = await prisma.paymentAttempt.create({
          data: {
            invoiceId: invoice.id,
            provider: 'mercadopago',
            providerPreferenceId: `pref_${Date.now()}_${subscription.id}`,
            providerPaymentId: null,
            externalReference: invoice.id,
            checkoutUrl: `https://checkout.mercadopago.com/${invoice.id}`,
            status: 'created',
            rawResponseJson: JSON.stringify({ message: 'Payment preference created' }),
          },
        })

        // Update subscription to grace period
        const graceUntil = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days grace period

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'grace_period',
            graceUntil,
          },
        })

        billedCount++
      } catch (error) {
        console.error(`Error billing subscription ${subscription.id}:`, error)
        errors.push(`Subscription ${subscription.id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      billedCount,
      totalProcessed: subscriptionsToBill.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Error in billing cycle cron:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
