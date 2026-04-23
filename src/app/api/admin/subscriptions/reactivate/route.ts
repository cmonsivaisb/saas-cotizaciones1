import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { ERROR_MESSAGES } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
      return NextResponse.json({ error: ERROR_MESSAGES.unauthorized }, { status: 401 })
    }

    const sessionData = JSON.parse(session)
    if (sessionData.role !== 'admin') {
      return NextResponse.json({ error: ERROR_MESSAGES.forbidden }, { status: 403 })
    }

    const body = await request.formData()
    const subscriptionId = body.get('subscriptionId') as string

    if (!subscriptionId) {
      return NextResponse.json({ error: ERROR_MESSAGES.required('subscription ID') }, { status: 400 })
    }

    const now = new Date()
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        suspendedAt: null,
        graceUntil: null,
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        nextBillingAt: newPeriodEnd,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}