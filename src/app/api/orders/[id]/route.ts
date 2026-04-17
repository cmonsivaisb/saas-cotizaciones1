import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        companyId,
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()
    const { clientId, items, total, notes, deliveryDate, status } = body

    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id }
    })

    // Update order
    const order = await prisma.order.updateMany({
      where: {
        id: params.id,
        companyId,
      },
      data: {
        clientId,
        total,
        notes,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        status: status || 'pending',
      },
    })

    if (order.count === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create new items
    if (items && items.length > 0) {
      await prisma.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: params.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        }))
      })
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          }
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const order = await prisma.order.deleteMany({
      where: {
        id: params.id,
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
