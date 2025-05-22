'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Present } from '@/types/prisma'
import { ReservationModal } from './ReservationModal'

interface PresentDetailsProps {
  id: string
}

export default function PresentDetails({ id }: PresentDetailsProps) {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string>()
  
  const { data: present, isLoading: isPresentLoading } = useQuery<Present>({
    queryKey: ['present', id],
    queryFn: async () => {
      const response = await fetch(`/api/presents/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch present details')
      }
      return response.json()
    },
  })

  const handleReserve = async (code: string) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      const response = await fetch(`/api/presents/${id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reserve present')
      }

      // Invalidate both the present details and the presents list queries
      queryClient.invalidateQueries({ queryKey: ['present', id] })
      queryClient.invalidateQueries({ queryKey: ['presents'] })
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error reserving present:', error)
      setError(error instanceof Error ? error.message : 'Failed to reserve present. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isPresentLoading) {
    return (
      <div className="min-h-screen p-8 bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!present) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Present not found</h1>
          <Link href="/" className="text-blue-700 hover:text-blue-900 font-medium">
            ← Back to presents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="block md:flex">
            <div className="w-full md:w-[600px] h-[600px] relative bg-gray-100">
              <Image
                src={present.image || '/images/placeholder.webp'}
                alt={present.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
                unoptimized
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/images/placeholder.webp';
                }}
              />
            </div>
            <div className="flex-1 p-6 md:p-8 flex flex-col">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{present.name}</h1>
                <p className="text-xl text-gray-800 font-medium mb-4">${present.price.toLocaleString()}</p>
                <p className="text-gray-700 mb-8">{present.description}</p>
              </div>
              <div className="mt-auto">
                {present.isReserved ? (
                  <span className="inline-block w-full text-center bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium">Reserved</span>
                ) : (
                  <button
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Reserve
                  </button>
                )}
                <Link href="/" className="mt-4 inline-block text-blue-700 hover:text-blue-900 font-medium">
                  ← Back to presents
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReserve}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 