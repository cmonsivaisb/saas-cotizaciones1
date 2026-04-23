import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createSubscriptionCheckoutPreference, toJsonSafe } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Get SaaS subscription invoice
    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        company: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    if (invoice.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice already paid' },
        { status: 400 }
      )
    }

    const preference = await createSubscriptionCheckoutPreference({
      requestUrl: request.url,
      invoiceId: invoice.id,
      concept: invoice.concept,
      amountMxn: invoice.amountMxn,
      payerEmail: invoice.company?.email,
      metadata: {
        subscriptionInvoiceId: invoice.id,
        companyId: invoice.companyId,
        subscriptionId: invoice.subscriptionId,
      },
    })

    // Create payment attempt
    const paymentAttempt = await prisma.subscriptionPaymentAttempt.create({
      data: {
        subscriptionInvoiceId: invoiceId,
        provider: 'mercadopago',
        providerPreferenceId: preference.preferenceId,
        providerPaymentId: null,
        externalReference: invoice.id,
        checkoutUrl: preference.checkoutUrl,
        status: 'redirected',
        rawResponseJson: toJsonSafe(preference.rawResponse),
      },
    })

    return NextResponse.json({
      paymentAttempt,
      checkoutUrl: paymentAttempt.checkoutUrl,
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
