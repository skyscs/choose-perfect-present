import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const adminUsername = process.env.ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD
const jwtSecret = process.env.JWT_SECRET

if (!adminUsername || !adminPassword || !jwtSecret) {
  throw new Error('Missing required environment variables for admin authentication')
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username !== adminUsername || password !== adminPassword) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(jwtSecret))

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 