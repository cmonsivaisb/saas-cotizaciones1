import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getMercadoPagoPaymentDetails, mapMercadoPagoStatusToAttemptStatus, toJsonSafe } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    const statusFromQuery = searchParams.get('status')
    const preferenceId = searchParams.get('preference_id')
    const externalReference = searchParams.get('external_reference')

    if (!preferenceId || !externalReference) {
      return NextResponse.redirect(new URL('/subscription?error=missing_params', request.url))
    }

    // Find the payment attempt
    const paymentAttempt = await prisma.subscriptionPaymentAttempt.findFirst({
      where: {
        providerPreferenceId: preferenceId,
        externalReference: externalReference,
      },
      include: {
        subscriptionInvoice: true,
      },
    })

    if (!paymentAttempt) {
      return NextResponse.redirect(new URL('/subscription?error=payment_not_found', request.url))
    }

    let paymentRawResponse: any = {
      payment_id: paymentId,
      preference_id: preferenceId,
      external_reference: externalReference,
      status: statusFromQuery,
      source: 'return_query',
    }
    let resolvedStatus = mapMercadoPagoStatusToAttemptStatus(statusFromQuery)

    if (paymentId) {
      try {
        const paymentDetails = await getMercadoPagoPaymentDetails(paymentId)
        paymentRawResponse = paymentDetails
        resolvedStatus = mapMercadoPagoStatusToAttemptStatus(paymentDetails.status)
      } catch (error) {
        console.error('Error verifying payment with Mercado Pago API:', error)
      }
    }

    await prisma.subscriptionPaymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        providerPaymentId: paymentId || paymentAttempt.providerPaymentId,
        status: resolvedStatus,
        rawResponseJson: toJsonSafe(paymentRawResponse),
      },
    })

    if (resolvedStatus !== 'approved') {
      if (resolvedStatus === 'pending') {
        return NextResponse.redirect(new URL('/subscription?status=pending', request.url))
      }

      return NextResponse.redirect(new URL('/subscription?error=payment_failed', request.url))
    }

    // Update invoice status
    await prisma.subscriptionInvoice.update({
      where: { id: paymentAttempt.subscriptionInvoiceId },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    })

    // Update subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { id: paymentAttempt.subscriptionInvoice.subscriptionId },
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

      await prisma.company.update({
        where: { id: subscription.companyId },
        data: {
          status: 'active',
        },
      })

      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('session')?.value

      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(sessionCookie)

          if (sessionData?.companyId === subscription.companyId) {
            const updatedSession = {
              ...sessionData,
              subscriptionStatus: 'active',
            }

            cookieStore.set('session', JSON.stringify(updatedSession), {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            })
          }
        } catch (error) {
          console.error('Error updating session cookie after payment:', error)
        }
      }
    }

    return NextResponse.redirect(new URL('/subscription?success=true', request.url))
  } catch (error) {
    console.error('Error processing payment success:', error)
    return NextResponse.redirect(new URL('/subscription?error=processing_error', request.url))
  }
}
