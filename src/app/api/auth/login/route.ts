import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, createSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ERROR_MESSAGES } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.emailRequired },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.invalidCredentials },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.invalidCredentials },
        { status: 401 }
      )
    }

    const session = createSession(user)

    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.serverError },
      { status: 500 }
    )
  }
}