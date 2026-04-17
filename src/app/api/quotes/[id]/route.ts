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

    const quote = await prisma.quote.findFirst({
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

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
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
    const { clientId, items, total, notes, validUntil, status } = body

    // Delete existing items
    await prisma.quoteItem.deleteMany({
      where: { quoteId: params.id }
    })

    // Update quote
    const quote = await prisma.quote.updateMany({
      where: {
        id: params.id,
        companyId,
      },
      data: {
        clientId,
        total,
        notes,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: status || 'draft',
      },
    })

    if (quote.count === 0) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Create new items
    if (items && items.length > 0) {
      await prisma.quoteItem.createMany({
        data: items.map((item: any) => ({
          quoteId: params.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        }))
      })
    }

    const updatedQuote = await prisma.quote.findUnique({
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

    return NextResponse.json(updatedQuote)
  } catch (error) {
    console.error('Error updating quote:', error)
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

    const quote = await prisma.quote.deleteMany({
      where: {
        id: params.id,
        companyId,
      },
    })

    if (quote.count === 0) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
