import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    const preferenceId = searchParams.get('preference_id')
    const externalReference = searchParams.get('external_reference')

    if (!paymentId || !externalReference) {
      return NextResponse.redirect(new URL('/billing?error=missing_params', request.url))
    }

    // Find the payment attempt
    const paymentAttempt = await prisma.paymentAttempt.findFirst({
      where: {
        providerPreferenceId: preferenceId,
        externalReference: externalReference,
      },
      include: {
        invoice: true,
      },
    })

    if (!paymentAttempt) {
      return NextResponse.redirect(new URL('/billing?error=payment_not_found', request.url))
    }

    // Update payment attempt
    await prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        providerPaymentId: paymentId,
        status: 'approved',
        rawResponseJson: JSON.stringify({
          payment_id: paymentId,
          preference_id: preferenceId,
          status: 'approved',
        }),
      },
    })

    // Update invoice status
    await prisma.invoice.update({
      where: { id: paymentAttempt.invoiceId },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    })

    // Update subscription status
    if (paymentAttempt.invoice.subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: paymentAttempt.invoice.subscriptionId },
      })

      if (subscription) {
        const now = new Date()
        const currentPeriodEnd = new Date(subscription.currentPeriodEnd)
        
        // Calculate new period
        const newPeriodStart = currentPeriodEnd > now ? currentPeriodEnd : now
        const newPeriodEnd = new Date(newPeriodStart)
        newPeriodEnd.setDate(newPeriodEnd.getDate() + 30) // 30 days

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'active',
            currentPeriodStart: newPeriodStart,
            currentPeriodEnd: newPeriodEnd,
            nextBillingAt: newPeriodEnd,
            graceUntil: null,
            suspendedAt: null,
          },
        })
      }
    }

    return NextResponse.redirect(new URL('/billing?success=true', request.url))
  } catch (error) {
    console.error('Error processing payment success:', error)
    return NextResponse.redirect(new URL('/billing?error=processing_error', request.url))
  }
}
