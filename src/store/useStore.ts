import { create } from 'zustand'
import type { Present } from '@/types/prisma'

interface Filters {
  minPrice: number
  maxPrice: number
}

interface Store {
  presents: Present[]
  filters: Filters
  setPresents: (presents: Present[]) => void
  setFilters: (filters: Partial<Filters>) => void
  filteredPresents: () => Present[]
}

export const useStore = create<Store>((set, get) => ({
  presents: [],
  filters: {
    minPrice: 0,
    maxPrice: 30000,
  },
  setPresents: (presents: Present[]) => set({ presents }),
  setFilters: (filters: Partial<Filters>) => 
    set((state) => ({ 
      filters: { ...state.filters, ...filters } 
    })),
  filteredPresents: () => {
    const { presents, filters } = get()
    return presents.filter((present) => 
      present.price >= filters.minPrice && present.price <= filters.maxPrice
    )
  },
})) 