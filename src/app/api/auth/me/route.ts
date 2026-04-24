import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    
    return NextResponse.json({
      name: session.name,
      email: session.email,
      role: session.role,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}