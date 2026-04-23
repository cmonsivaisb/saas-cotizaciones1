import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ERROR_MESSAGES } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session')

    redirect('/login')
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
