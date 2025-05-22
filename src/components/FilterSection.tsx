'use client'

import React from 'react'
import { useStore } from '@/store/useStore'
import { useCurrency } from './CurrencyProvider'

interface FilterSectionProps {
  className?: string
}

type SortOrder = 'asc' | 'desc';

type PriceRange = {
  label: string;
  minPrice: number;
  maxPrice: number;
};

const PRICE_RANGES: PriceRange[] = [
  { label: 'All', minPrice: 0, maxPrice: Infinity },
  { label: 'Budget', minPrice: 0, maxPrice: 200 },
  { label: 'Standard', minPrice: 200, maxPrice: 2000 },
  { label: 'Luxury', minPrice: 2000, maxPrice: Infinity }
];

export function FilterSection({ className = '' }: FilterSectionProps) {
  const { filters, setFilters } = useStore()
  const { currency, rates } = useCurrency()
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');

  // Set default filter to 'All' on component mount
  React.useEffect(() => {
    if (filters.minPrice === 0 && filters.maxPrice === 30000) {
      handlePriceRangeSelect(PRICE_RANGES[0]);
    }
  }, []);

  const handlePriceRangeSelect = (range: PriceRange) => {
    setFilters({ minPrice: range.minPrice, maxPrice: range.maxPrice })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOrder;
    setSortOrder(value);
    setFilters({ ...filters, sortOrder: value });
  };

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
            Price Range
          </label>
          <div className="flex gap-2">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                className={`px-3 py-1 rounded font-semibold border ${
                  filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-blue-50'
                }`}
                onClick={() => handlePriceRangeSelect(range)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by Price</label>
          <select
            className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  )
} 