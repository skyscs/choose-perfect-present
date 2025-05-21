import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const secretCode = process.env.PRESENTS_SECRET_CODE

if (!secretCode) {
  throw new Error('PRESENTS_SECRET_CODE is not defined in environment variables')
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
): Promise<Response> {
  try {
    const body = await request.json()
    const { code } = body
    const { id } = await params

    // Verify the secret code
    if (code !== secretCode) {
      return Response.json(
        { error: 'Invalid code' },
        { status: 401 }
      )
    }

    // Check if present exists and is not already reserved
    const present = await prisma.present.findUnique({
      where: { id }
    })

    if (!present) {
      return Response.json(
        { error: 'Present not found' },
        { status: 404 }
      )
    }

    if (present.isReserved) {
      return Response.json(
        { error: 'Present is already reserved' },
        { status: 400 }
      )
    }

    // Reserve the present
    const updatedPresent = await prisma.present.update({
      where: { id },
      data: { isReserved: true }
    })

    return Response.json(updatedPresent)
  } catch (error) {
    console.error('Failed to reserve present:', error)
    return Response.json(
      { error: 'Failed to reserve present' },
      { status: 500 }
    )
  }
} 