import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: orderId } = await params

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        companyId,
      },
      include: {
        customer: true,
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Solo se pueden generar facturas para pedidos entregados' },
        { status: 400 }
      )
    }

    const orderIdPrefix = orderId.slice(0, 8)

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        companyId,
        orderId,
      },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Ya existe una factura para este pedido' },
        { status: 400 }
      )
    }

    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        companyId,
        concept: {
          startsWith: 'FAC-',
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const lastInvoiceNumber = (() => {
      if (!lastInvoice) return 0
      const match = lastInvoice.concept.match(/^FAC-(\d+)/)
      if (!match) return 0
      return parseInt(match[1], 10)
    })()

    const folio = `FAC-${(lastInvoiceNumber + 1).toString().padStart(6, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        orderId,
        concept: `${folio} - Pedido ${orderIdPrefix}`,
        amountMxn: order.total,
        currency: 'MXN',
        status: 'pending',
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quickReference: null,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice from order:', error)
    return NextResponse.json(
      { error: 'Error al generar factura' },
      { status: 500 }
    )
  }
}
