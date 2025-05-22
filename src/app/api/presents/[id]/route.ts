import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/presents/[id] - Get a single present
export async function GET(
  request: NextRequest,
  { params }: RouteContext
): Promise<Response> {
  try {
    const { id } = await params
    const present = await prisma.present.findUnique({
      where: { id }
    })

    if (!present) {
      return Response.json(
        { error: 'Present not found' },
        { status: 404 }
      )
    }

    return Response.json(present)
  } catch (error) {
    console.error('Failed to fetch present:', error)
    return Response.json(
      { error: 'Failed to fetch present' },
      { status: 500 }
    )
  }
}

// PUT /api/presents/[id] - Update a present
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
): Promise<Response> {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, image, isReserved } = body

    const present = await prisma.present.update({
      where: { id },
      data: {
        name,
        description,
        price,
        image,
        isReserved
      }
    })

    return Response.json(present)
  } catch (error) {
    console.error('Failed to update present:', error)
    return Response.json(
      { error: 'Failed to update present' },
      { status: 500 }
    )
  }
}

// DELETE /api/presents/[id] - Delete a present
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
): Promise<Response> {
  try {
    const { id } = await params
    await prisma.present.delete({
      where: { id }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete present:', error)
    return Response.json(
      { error: 'Failed to delete present' },
      { status: 500 }
    )
  }
} 