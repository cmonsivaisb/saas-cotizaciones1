import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    // Get Mercado Pago signature
    const signature = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')

    // Verify signature (optional but recommended)
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Log webhook event
    const webhookEvent = await prisma.mercadoPagoWebhookEvent.create({
      data: {
        topic: data.type || data.topic,
        action: data.action,
        resourceId: data.data?.id,
        signatureValid: !webhookSecret || signature !== undefined,
        payloadJson: body,
        processed: false,
      },
    })

    // Process the webhook based on type
    const topic = data.type || data.topic
    const resourceId = data.data?.id

    if (topic === 'payment' && resourceId) {
      await processPayment(resourceId, webhookEvent.id)
    } else if (topic === 'preapproval' && resourceId) {
      await processPreapproval(resourceId, webhookEvent.id)
    }

    // Mark webhook as processed
    await prisma.mercadoPagoWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Mercado Pago webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processPayment(paymentId: string, webhookEventId: string) {
  try {
    // Find payment attempt by provider payment ID
    const paymentAttempt = await prisma.paymentAttempt.findFirst({
      where: {
        providerPaymentId: paymentId,
      },
      include: {
        invoice: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!paymentAttempt) {
      console.log(`Payment attempt not found for payment ID: ${paymentId}`)
      return
    }

    // Get payment details from Mercado Pago API
    // Note: This is a placeholder - actual API call would be here
    const paymentDetails = await getMercadoPagoPaymentDetails(paymentId)

    if (!paymentDetails) {
      console.log(`Could not fetch payment details for: ${paymentId}`)
      return
    }

    // Update payment attempt
    await prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        status: paymentDetails.status,
        rawResponseJson: JSON.stringify(paymentDetails),
      },
    })

    // Process based on payment status
    if (paymentDetails.status === 'approved') {
      // Update invoice
      await prisma.invoice.update({
        where: { id: paymentAttempt.invoiceId },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })

      // Update subscription if exists
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

          // Reactivate company if suspended
          await prisma.company.update({
            where: { id: subscription.companyId },
            data: {
              status: 'active',
            },
          })
        }
      }
    } else if (paymentDetails.status === 'rejected' || paymentDetails.status === 'cancelled') {
      // Invoice remains pending, user can try again
      console.log(`Payment ${paymentId} was ${paymentDetails.status}`)
    }
  } catch (error) {
    console.error('Error processing payment:', error)
  }
}

async function processPreapproval(preapprovalId: string, webhookEventId: string) {
  // Handle preapproval (recurring payments) if needed
  console.log(`Processing preapproval: ${preapprovalId}`)
}

async function getMercadoPagoPaymentDetails(paymentId: string) {
  try {
    // Placeholder for actual Mercado Pago API call
    // In production, you would call:
    // const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    //   },
    // })
    // const data = await response.json()
    // return data

    // For now, return mock data
    return {
      id: paymentId,
      status: 'approved',
      date_approved: new Date().toISOString(),
      transaction_amount: 1000,
    }
  } catch (error) {
    console.error('Error fetching payment details:', error)
    return null
  }
}
