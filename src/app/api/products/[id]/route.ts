import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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

    const item = await prisma.item.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
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
    const { name, description, price, sku, stock } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    const item = await prisma.item.updateMany({
      where: {
        id,
        companyId,
      },
      data: {
        name,
        description,
        salePrice: price,
        sku,
        stockQuantity: stock !== undefined ? stock : undefined,
      },
    })

    if (item.count === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const updatedItem = await prisma.item.findUnique({
      where: { id },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating item:', error)
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

    const item = await prisma.item.deleteMany({
      where: {
        id,
        companyId,
      },
    })

    if (item.count === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
