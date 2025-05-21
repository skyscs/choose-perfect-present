'use client'

import { PresentsList } from '@/components/PresentsList'
import { FilterSection } from '@/components/FilterSection'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Welcome Section */}
            <div className="lg:col-span-2">
              <section className="h-full bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center gap-8 h-full">
                  <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src="/images/welcome-portrait.png"
                      alt="Welcome portrait"
                      fill
                      className="rounded-lg object-cover shadow-lg transition-transform hover:scale-105"
                      priority
                      sizes="192px"
                      quality={90}
                    />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Find Your Perfect Gift</h1>
                    <p className="text-lg text-gray-600">
                      Browse through my wishlist and discover the ideal present that matches your budget. 
                      Once you've found something special, just reach out to me for a secret code to reserve it.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Filter Section */}
            <div className="lg:col-span-1">
              <FilterSection className="h-full" />
            </div>
          </div>

          {/* Presents List */}
          <div className="mt-8">
            <PresentsList />
          </div>
        </div>
      </main>
    </div>
  )
}
