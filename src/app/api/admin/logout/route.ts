import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Clear the admin token cookie
    const cookieStore = await cookies()
    cookieStore.delete('admin_token')
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
} 