// Temporary type definitions until Prisma client is generated
export interface Present {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  isReserved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AdminUser {
  id: string
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface SecretCode {
  id: string
  code: string
  isUsed: boolean
  usedAt: Date | null
  createdAt: Date
  updatedAt: Date
} 