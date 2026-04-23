import { NextRequest, NextResponse } from 'next/server'
import { ERROR_MESSAGES } from '@/lib/errors'
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

    // Generate folio (could be enhanced to be unique per company)
    const folio = `COT-${Date.now()}`

    // Calculate subtotal from items
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0)

    const quote = await prisma.quote.create({
      data: {
        customerId,
        companyId,
        folio,
        subtotal,
        total,
        notes,
        validUntil: validUntil ? new Date(validUntil) : defaultValidUntil,
        status: status || 'draft',
        items: {
          create: items.map((item: any) => ({
            itemId: item.productId || null,
            description: item.productName || item.description || "",
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

    const where: any = { companyId }

    if (search) {
      where.OR = [
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          }
        }
      }
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
