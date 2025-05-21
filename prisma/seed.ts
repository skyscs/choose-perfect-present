import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const presents = [
  {
    name: "Apple AirPods Pro",
    description: "Active noise cancellation for immersive sound. Transparency mode for hearing what's happening around you.",
    price: 249.99,
    images: ["/images/airpods.webp"],
    isReserved: false
  },
  {
    name: "Apple Watch Series 9",
    description: "The most powerful Apple Watch yet with advanced health features and a stunning Retina display.",
    price: 399.99,
    images: ["/images/watch.webp"],
    isReserved: false
  },
  {
    name: "Jeep Wrangler",
    description: "The iconic off-road vehicle with unmatched capability and legendary style.",
    price: 29995.00,
    images: ["/images/jeep.webp"],
    isReserved: false
  },
  {
    name: 'MacBook Pro 16"',
    description: "Supercharged by M3 Pro or M3 Max. The most powerful laptop in its class for demanding workflows.",
    price: 2499.99,
    images: ["/images/macbook.webp"],
    isReserved: false
  },
  {
    name: "PlayStation 5",
    description: "Experience lightning-fast loading, deeper immersion, and an all-new generation of incredible PlayStation games.",
    price: 499.99,
    images: ["/images/ps5.webp"],
    isReserved: false
  },
  {
    name: "DJI Mini 3 Pro",
    description: "Lightweight sub-249g drone with 4K/60fps video, 48MP photos, and advanced safety features.",
    price: 759.00,
    images: ["/images/drone.webp"],
    isReserved: false
  },
  {
    name: "iPhone 15 Pro Max",
    description: "The most advanced iPhone ever with a titanium design, A17 Pro chip, and a pro camera system.",
    price: 1199.99,
    images: ["/images/iphone.webp"],
    isReserved: false
  },
  {
    name: 'Samsung 65" OLED TV',
    description: "Quantum HDR OLED display with Neural Quantum Processor for stunning picture quality.",
    price: 2299.99,
    images: ["/images/tv.webp"],
    isReserved: false
  },
  {
    name: "Dyson V15 Detect",
    description: "Powerful cordless vacuum with laser dust detection and intelligent suction optimization.",
    price: 749.99,
    images: ["/images/vacuum.webp"],
    isReserved: false
  },
  {
    name: 'iPad Pro 12.9"',
    description: "Brilliant Liquid Retina XDR display, M2 chip, and pro cameras with LiDAR Scanner.",
    price: 1099.99,
    images: ["/images/ipad.webp"],
    isReserved: false
  },
  {
    name: "Nintendo Switch OLED",
    description: "Enhanced gaming system with vibrant 7-inch OLED screen and improved audio.",
    price: 349.99,
    images: ["/images/switch.webp"],
    isReserved: false
  },
  {
    name: "Sonos Arc",
    description: "Premium smart soundbar with Dolby Atmos and voice control for immersive home theater.",
    price: 899.99,
    images: ["/images/soundbar.webp"],
    isReserved: false
  }
]

async function main() {
  console.log('Start seeding...')

  // Clear existing data
  await prisma.present.deleteMany()
  console.log('Cleared existing presents')

  // Create new presents
  for (const present of presents) {
    const createdPresent = await prisma.present.create({
      data: present
    })
    console.log(`Created present: ${createdPresent.name}`)
  }

  console.log('Seeding finished')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 