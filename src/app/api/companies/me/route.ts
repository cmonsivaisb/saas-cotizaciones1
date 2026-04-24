import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { companyId } = JSON.parse(session)
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: company.id,
      name: company.name,
      contactName: company.contactName,
      email: company.email,
      phone: company.phone,
      city: company.city,
      businessType: company.businessType,
      bankName: company.bankName,
      bankAccount: company.bankAccount,
      clabe: company.clabe,
      paymentReference: company.paymentReference,
    })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Error fetching company' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { companyId } = JSON.parse(session)
    const body = await request.json()

    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: body.name,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        city: body.city,
        bankName: body.bankName || null,
        bankAccount: body.bankAccount || null,
        clabe: body.clabe || null,
        paymentReference: body.paymentReference || null,
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Error updating company' }, { status: 500 })
  }
}