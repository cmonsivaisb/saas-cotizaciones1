import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { ERROR_MESSAGES } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const order = await prisma.order.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}

async function updateOrder(id: string, companyId: string, body: any) {
  const { customerId, items, total, notes, dueDate, status } = body

  // Delete existing items
  await prisma.orderItem.deleteMany({
    where: { orderId: id }
  })

  // Update order
  const order = await prisma.order.updateMany({
    where: {
      id,
      companyId,
    },
    data: {
      customerId,
      total,
      notes,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: status || 'pending',
    },
  })

  if (order.count === 0) {
    throw new Error('Order not found')
  }

  // Create new items
  if (items && items.length > 0) {
    await prisma.orderItem.createMany({
      data: items.map((item: any) => ({
        orderId: id,
        itemId: item.itemId || null,
        description: item.description,
        qty: item.qty,
        unitPrice: item.unitPrice,
        amount: item.amount,
      }))
    })
  }

  const updatedOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          item: true,
        }
      }
    }
  })

  return updatedOrder
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    
    const updatedOrder = await updateOrder(id, companyId, body)

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error('Error updating order:', error)
    if (error.message === 'Order not found') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    
    const updatedOrder = await updateOrder(id, companyId, body)

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error('Error updating order:', error)
    if (error.message === 'Order not found') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const order = await prisma.order.deleteMany({
      where: {
        id,
        companyId,
      },
    })

    if (order.count === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
