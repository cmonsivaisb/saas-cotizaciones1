import { NextRequest, NextResponse } from 'next/server'
import { ERROR_MESSAGES } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createNotification } from '@/lib/notifications'

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
    const { clientId, items, total, notes, deliveryDate, status } = body

    if (!clientId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Client and items are required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: {
        customerId: clientId,
        companyId,
        subtotal: total,
        total,
        notes,
        dueDate: deliveryDate ? new Date(deliveryDate) : null,
        status: status || 'pending',
        items: {
          create: items.map((item: any) => ({
            itemId: item.productId,
            description: item.description || '',
            qty: item.quantity,
            unitPrice: item.price,
            amount: item.total,
          }))
        }
      },
      include: {
        customer: true,
        items: true,
      }
    })

    await createNotification({
      companyId,
      type: 'order_created',
      title: 'Nuevo pedido creado',
      message: `Se creó el pedido #${order.orderNumber} para ${order.customer.businessName} por $${order.total.toLocaleString('es-MX')}`,
      link: `/orders/${order.id}`,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = { companyId }
    
    if (search) {
      where.OR = [
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
        { orderNumber: parseInt(search) || undefined },
      ]
    }

    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: true,
          items: {
            include: {
              item: true,
            }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
