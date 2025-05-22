import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/presents - Get all presents
export async function GET() {
  try {
    const presents = await prisma.present.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(presents)
  } catch (error) {
    console.error('Failed to fetch presents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presents' },
      { status: 500 }
    )
  }
}

// POST /api/presents - Create a new present
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, images } = body

    const present = await prisma.present.create({
      data: {
        name,
        description,
        price,
        images: Array.isArray(images) ? JSON.stringify(images) : images,
        isReserved: false
      }
    })

    return NextResponse.json(present)
  } catch (error) {
    console.error('Failed to create present:', error)
    return NextResponse.json(
      { error: 'Failed to create present' },
      { status: 500 }
    )
  }
} 