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
    const { name, email, phone, address, rfc, taxId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        businessName: name,
        contactName: name,
        email,
        phone,
        address,
        rfc,
        taxId,
        companyId,
      },
    })

    await createNotification({
      companyId,
      type: 'client_created',
      title: 'Nuevo cliente agregado',
      message: `Se registró el cliente ${name}`,
      link: `/clients/${customer.id}`,
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error creating client:', error)
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

    const where: any = { companyId }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const clients = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            quotes: true,
            orders: true,
          }
        }
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}
