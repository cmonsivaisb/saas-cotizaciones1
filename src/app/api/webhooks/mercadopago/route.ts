import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getMercadoPagoPaymentDetails, mapMercadoPagoStatusToAttemptStatus, toJsonSafe } from '@/lib/mercadopago'
import { ERROR_MESSAGES } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    const signature = request.headers.get('x-signature')
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || process.env.MERCADO_PAGO_WEBHOOK_SECRET
    let signatureValid = !webhookSecret

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      signatureValid = signature === expectedSignature
    }

    const topic = data.type || data.topic || 'unknown'
    const resourceId = String(data.data?.id || data.id || '')

    const webhookEvent = await prisma.mercadoPagoWebhookEvent.create({
      data: {
        topic,
        action: data.action,
        resourceId,
        signatureValid,
        payloadJson: toJsonSafe(data),
        processed: false,
      },
    })

    if (topic === 'payment' && resourceId) {
      await processPayment(resourceId)
    } else if (topic === 'preapproval' && resourceId) {
      await processPreapproval(resourceId)
    }

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
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}

async function processPayment(paymentId: string) {
  try {
    const paymentDetails = await getMercadoPagoPaymentDetails(paymentId)
    const paymentStatus = mapMercadoPagoStatusToAttemptStatus(paymentDetails.status)
    const externalReference = paymentDetails.external_reference ? String(paymentDetails.external_reference) : null

    let paymentAttempt = await prisma.subscriptionPaymentAttempt.findFirst({
      where: {
        providerPaymentId: paymentId,
      },
      include: {
        subscriptionInvoice: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!paymentAttempt && externalReference) {
      paymentAttempt = await prisma.subscriptionPaymentAttempt.findFirst({
        where: {
          externalReference,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          subscriptionInvoice: {
            include: {
              subscription: true,
            },
          },
        },
      })
    }

    if (!paymentAttempt) {
      console.log(`Payment attempt not found for payment ID: ${paymentId}`)
      return
    }

    await prisma.subscriptionPaymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        providerPaymentId: paymentId,
        status: paymentStatus,
        rawResponseJson: toJsonSafe(paymentDetails),
      },
    })

    if (paymentStatus === 'approved') {
      await prisma.subscriptionInvoice.update({
        where: { id: paymentAttempt.subscriptionInvoiceId },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })

      const subscription = await prisma.subscription.findUnique({
        where: { id: paymentAttempt.subscriptionInvoice.subscriptionId },
      })

      if (subscription) {
        const now = new Date()
        const currentPeriodEnd = new Date(subscription.currentPeriodEnd)

        const newPeriodStart = currentPeriodEnd > now ? currentPeriodEnd : now
        const newPeriodEnd = new Date(newPeriodStart)
        newPeriodEnd.setDate(newPeriodEnd.getDate() + 30)

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
      }
    } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
      console.log(`Payment ${paymentId} was ${paymentStatus}`)
    }
  } catch (error) {
    console.error('Error processing payment:', error)
  }
}

async function processPreapproval(preapprovalId: string) {
  console.log(`Processing preapproval: ${preapprovalId}`)
}
