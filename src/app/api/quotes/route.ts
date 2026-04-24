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
    const { customerId, items, total, notes, validUntil, status } = body

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer and items are required' },
        { status: 400 }
      )
    }

// Default validUntil to 30 days from now if not provided
  const defaultValidUntil = new Date()
  defaultValidUntil.setDate(defaultValidUntil.getDate() + 30)

  // Calculate subtotal from items
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0)

    const quote = await prisma.quote.create({
      data: {
        customerId,
        companyId,
        subtotal,
        total,
        notes,
        validUntil: validUntil ? new Date(validUntil) : defaultValidUntil,
        status: status || 'draft',
        items: {
          create: items.map((item: any) => ({
            itemId: item.productId || null,
            description: item.description || item.productName || "",
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
      type: 'quote_created',
      title: 'Nueva cotización creada',
      message: `Se creó la cotización #${quote.quoteNumber} para ${quote.customer.businessName} por $${quote.total.toLocaleString('es-MX')}`,
      link: `/quotes/${quote.id}`,
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error creating quote:', error)
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
        { quoteNumber: parseInt(search) || undefined },
      ]
    }

    if (status) {
      where.status = status
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
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
      prisma.quote.count({ where })
    ])

    return NextResponse.json({
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
