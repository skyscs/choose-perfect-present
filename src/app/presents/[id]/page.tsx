'use client'

import { use } from 'react'
import PresentDetails from '@/components/PresentDetails'

export default function PresentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PresentDetails id={id} />
} 