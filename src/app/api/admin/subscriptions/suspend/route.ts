import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionData = JSON.parse(session)
    if (sessionData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.formData()
    const subscriptionId = body.get('subscriptionId') as string

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'suspended',
        suspendedAt: new Date(),
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error suspending subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}