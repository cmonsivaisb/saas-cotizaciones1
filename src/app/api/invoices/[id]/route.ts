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

    const invoice = await prisma.invoice.findFirst({
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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
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
    const { clientId, items, total, notes, dueDate, status } = body

    // Delete existing items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: params.id }
    })

    // Update invoice
    const invoice = await prisma.invoice.updateMany({
      where: {
        id: params.id,
        companyId,
      },
      data: {
        clientId,
        total,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'draft',
      },
    })

    if (invoice.count === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Create new items
    if (items && items.length > 0) {
      await prisma.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: params.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        }))
      })
    }

    const updatedInvoice = await prisma.invoice.findUnique({
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

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
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

    const invoice = await prisma.invoice.deleteMany({
      where: {
        id: params.id,
        companyId,
      },
    })

    if (invoice.count === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
