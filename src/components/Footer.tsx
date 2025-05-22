'use client'

import React from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-sm">
          © {currentYear} Created by Viacheslav Filipov & Cursor AI
        </p>
      </div>
    </footer>
  )
} 