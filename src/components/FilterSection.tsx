'use client'

import React from 'react'
import { useStore } from '@/store/useStore'
import * as Slider from '@radix-ui/react-slider'
import { useCurrency } from './CurrencyProvider'

interface FilterSectionProps {
  className?: string
}

export function FilterSection({ className = '' }: FilterSectionProps) {
  const { filters, setFilters } = useStore()
  const [priceRange, setPriceRange] = React.useState([filters.minPrice, filters.maxPrice])
  const { currency, rates } = useCurrency()

  const handlePriceChange = React.useCallback(
    (values: number[]) => {
      setPriceRange(values)
      setFilters({ minPrice: values[0], maxPrice: values[1] })
    },
    [setFilters]
  )

  const convert = (usd: number) => Math.round((usd / rates['USD']) * rates[currency])

  const formatPrice = (price: number) => {
    return `${currency} ${convert(price)}`
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-6`}>
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Filters</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </label>
          <form className="px-1">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={priceRange}
              onValueChange={handlePriceChange}
              min={0}
              max={30000}
              step={100}
              minStepsBetweenThumbs={1}
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-white border border-gray-300 shadow-md rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Minimum price"
              />
              <Slider.Thumb
                className="block w-5 h-5 bg-white border border-gray-300 shadow-md rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Maximum price"
              />
            </Slider.Root>
          </form>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(30000)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => handlePriceChange([0, 30000])}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
} 