'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

interface Present {
  id: string
  name: string
  description: string
  price: number
  image: string
  isReserved: boolean
}

interface PresentFormData {
  name: string
  description: string
  price: string
  image: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPresent, setEditingPresent] = useState<Present | null>(null)
  const [formData, setFormData] = useState<PresentFormData>({
    name: '',
    description: '',
    price: '',
    image: ''
  })

  // Fetch presents
  const { data: presents, isLoading } = useQuery<Present[]>({
    queryKey: ['presents'],
    queryFn: async () => {
      const res = await fetch('/api/presents')
      if (!res.ok) throw new Error('Failed to fetch presents')
      return res.json()
    }
  })

  // Add present mutation
  const addPresentMutation = useMutation({
    mutationFn: async (data: PresentFormData) => {
      const res = await fetch('/api/presents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, price: parseFloat(data.price) }),
      })
      if (!res.ok) throw new Error('Failed to add present')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presents'] })
      setIsAddModalOpen(false)
      resetForm()
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to add present')
    },
  })

  // Edit present mutation
  const editPresentMutation = useMutation({
    mutationFn: async (data: Present) => {
      const res = await fetch(`/api/presents/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update present')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presents'] })
      setEditingPresent(null)
      resetForm()
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update present')
    },
  })

  // Delete present mutation
  const deletePresentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/presents/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete present')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presents'] })
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to delete present')
    },
  })

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Logout failed')
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPresent) {
      editPresentMutation.mutate({
        ...editingPresent,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
      })
    } else {
      addPresentMutation.mutate(formData)
    }
  }

  const startEdit = (present: Present) => {
    setEditingPresent(present)
    setFormData({
      name: present.name,
      description: present.description,
      price: present.price.toString(),
      image: present.image,
    })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this present?')) {
      deletePresentMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Present
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-red-500">{error}</div>
          )}

          {/* Add/Edit Form Modal */}
          {(isAddModalOpen || editingPresent) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">
                  {editingPresent ? 'Edit Present' : 'Add New Present'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 font-medium mb-2">Image URL</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-full text-gray-900 bg-white placeholder-gray-500"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false)
                        setEditingPresent(null)
                        resetForm()
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingPresent ? 'Save Changes' : 'Add Present'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Presents List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {presents?.map((present) => (
                <li key={present.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {present.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {present.description}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ${present.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        present.isReserved 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {present.isReserved ? 'Reserved' : 'Available'}
                      </span>
                      <button
                        onClick={() => startEdit(present)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(present.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 