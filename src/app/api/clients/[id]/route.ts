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

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        _count: {
          select: {
            quotes: true,
            orders: true,
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
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
    const { name, email, phone, address, rfc, taxId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.updateMany({
      where: {
        id,
        companyId,
      },
      data: {
        businessName: name,
        contactName: name,
        email,
        phone,
        source: address,
        notes: rfc,
      },
    })

    if (customer.count === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id },
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
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

    const customer = await prisma.customer.deleteMany({
      where: {
        id,
        companyId,
      },
    })

    if (customer.count === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
