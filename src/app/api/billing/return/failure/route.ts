import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    const preferenceId = searchParams.get('preference_id')
    const externalReference = searchParams.get('external_reference')

    if (preferenceId && externalReference) {
      // Find and update payment attempt
      const paymentAttempt = await prisma.subscriptionPaymentAttempt.findFirst({
        where: {
          providerPreferenceId: preferenceId,
          externalReference: externalReference,
        },
      })

      if (paymentAttempt) {
        await prisma.subscriptionPaymentAttempt.update({
          where: { id: paymentAttempt.id },
          data: {
            providerPaymentId: paymentId,
            status: 'rejected',
            rawResponseJson: {
              payment_id: paymentId,
              preference_id: preferenceId,
              external_reference: externalReference,
              status: 'rejected',
            },
          },
        })
      }
    }

    return NextResponse.redirect(new URL('/subscription?error=payment_failed', request.url))
  } catch (error) {
    console.error('Error processing payment failure:', error)
    return NextResponse.redirect(new URL('/subscription?error=processing_error', request.url))
  }
}
