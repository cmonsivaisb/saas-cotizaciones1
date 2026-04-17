import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const orderId = params.id

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { paymentDate, amount, method, notes } = body

    if (!paymentDate || !amount || !method) {
      return NextResponse.json(
        { error: 'Payment date, amount, and method are required' },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await prisma.orderPayment.create({
      data: {
        orderId,
        paymentDate: new Date(paymentDate),
        amount: parseFloat(amount),
        method,
        notes,
      },
    })

    // Calculate total paid
    const allPayments = await prisma.orderPayment.findMany({
      where: { orderId },
    })

    const totalPaid = allPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
    const balance = order.total - totalPaid

    // Update order status if fully paid
    if (balance <= 0) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'completed',
        },
      })
    }

    return NextResponse.json({
      payment,
      totalPaid: totalPaid + parseFloat(amount),
      balance,
      orderStatus: balance <= 0 ? 'completed' : order.status,
    })
  } catch (error) {
    console.error('Error creating order payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const orderId = params.id

    // Get order with payments
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Calculate totals
    const totalPaid = order.payments.reduce((sum: number, p: any) => sum + p.amount, 0)
    const balance = order.total - totalPaid

    return NextResponse.json({
      order,
      payments: order.payments,
      totalPaid,
      balance,
      isFullyPaid: balance <= 0,
    })
  } catch (error) {
    console.error('Error fetching order payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
