import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSubscriptionCheckoutPreference, toJsonSafe } from '@/lib/mercadopago'
import { ERROR_MESSAGES } from '@/lib/errors'

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
        const invoice = await prisma.subscriptionInvoice.create({
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

        let providerPreferenceId: string | null = null
        let checkoutUrl: string | null = null
        let paymentAttemptStatus: 'redirected' | 'error' = 'error'
        let paymentRawResponse: any = { message: 'preference_not_created' }

        try {
          const preference = await createSubscriptionCheckoutPreference({
            requestUrl: request.url,
            invoiceId: invoice.id,
            concept: invoice.concept,
            amountMxn: invoice.amountMxn,
            payerEmail: subscription.company.email,
            metadata: {
              subscriptionInvoiceId: invoice.id,
              companyId: subscription.companyId,
              subscriptionId: subscription.id,
            },
          })

          providerPreferenceId = preference.preferenceId
          checkoutUrl = preference.checkoutUrl
          paymentAttemptStatus = 'redirected'
          paymentRawResponse = preference.rawResponse
        } catch (preferenceError) {
          console.error(`Error creating Mercado Pago preference for invoice ${invoice.id}:`, preferenceError)
        }

        await prisma.subscriptionPaymentAttempt.create({
          data: {
            subscriptionInvoiceId: invoice.id,
            provider: 'mercadopago',
            providerPreferenceId,
            providerPaymentId: null,
            externalReference: invoice.id,
            checkoutUrl,
            status: paymentAttemptStatus,
            rawResponseJson: toJsonSafe(paymentRawResponse),
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

        await prisma.company.update({
          where: { id: subscription.companyId },
          data: {
            status: 'grace_period',
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
      { error: ERROR_MESSAGES.serverError, details: error },
      { status: 500 }
    )
  }
}
