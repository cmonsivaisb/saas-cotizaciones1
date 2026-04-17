import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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

    // Get invoice with subscription
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
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

    // Create payment attempt with Mercado Pago
    // Note: This is a placeholder - actual Mercado Pago integration will be added later
    const paymentAttempt = await prisma.paymentAttempt.create({
      data: {
        invoiceId,
        provider: 'mercadopago',
        providerPreferenceId: `pref_${Date.now()}`,
        providerPaymentId: null,
        externalReference: invoice.id,
        checkoutUrl: `https://checkout.mercadopago.com/${invoice.id}`,
        status: 'created',
        rawResponseJson: JSON.stringify({ message: 'Payment preference created' }),
      },
    })

    return NextResponse.json({
      paymentAttempt,
      checkoutUrl: paymentAttempt.checkoutUrl,
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
