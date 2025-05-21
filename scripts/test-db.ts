const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Test connection
    await prisma.$connect()
    console.log('Successfully connected to database')

    // Test query
    const count = await prisma.present.count()
    console.log('Number of presents in database:', count)

    // Test fetching all presents
    const presents = await prisma.present.findMany()
    console.log('All presents:', presents)

  } catch (error) {
    console.error('Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 