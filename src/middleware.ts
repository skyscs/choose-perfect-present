import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip auth check for login page
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next()
    }

    const token = request.cookies.get('admin_token')

    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    try {
      // Verify the token
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined')
      }

      await jwtVerify(
        token.value,
        new TextEncoder().encode(jwtSecret)
      )

      return NextResponse.next()
    } catch (error) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
} 