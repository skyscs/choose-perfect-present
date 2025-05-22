'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@/store/useStore'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Present } from '@/types/prisma'

interface PresentsListProps {
  className?: string
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

async function fetchPresents(): Promise<Present[]> {
  const response = await fetch('/api/presents')
  if (!response.ok) {
    throw new Error('Failed to fetch presents')
  }
  return response.json()
}

export function PresentsList({ className = '' }: PresentsListProps) {
  const { filters, setPresents } = useStore()

  const query = useQuery<Present[], Error>({
    queryKey: ['presents'],
    queryFn: fetchPresents,
  })

  const { data: presents, isLoading, error, isError } = query

  React.useEffect(() => {
    if (presents) {
      console.log('Setting presents in store:', presents)
      setPresents(presents)
    }
  }, [presents, setPresents])

  const filtered = React.useMemo(() => {
    if (!presents) return []
    return presents.filter((present) => 
      present.price >= filters.minPrice && present.price <= filters.maxPrice
    )
  }, [presents, filters])

  console.log('Render state:', { isLoading, isError, error, presentsCount: presents?.length, filteredCount: filtered.length })

  if (isError) {
    return (
      <div className={`${className} flex justify-center items-center h-96 bg-white rounded-lg shadow-md`}>
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error loading presents</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`${className} flex justify-center items-center h-96 bg-white rounded-lg shadow-md`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!filtered.length) {
    return (
      <div className={`${className} flex justify-center items-center h-96 bg-white rounded-lg shadow-md`}>
        <div className="text-gray-500 text-center">
          <p className="text-xl font-semibold mb-2">No presents found</p>
          <p className="text-sm">Try adjusting the price range filter</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-8`}>
      <div data-testid="presents-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((present: Present) => (
          <motion.div
            key={present.id}
            data-testid="present-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
          >
            <Link href={`/presents/${present.id}`}>
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={present.image || '/images/placeholder.webp'}
                  alt={present.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                  unoptimized
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/images/placeholder.webp';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{present.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{present.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-semibold">${present.price.toFixed(2)}</span>
                  <span className={`px-2 py-1 rounded text-sm ${present.isReserved ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{present.isReserved ? 'Reserved' : 'Available'}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 