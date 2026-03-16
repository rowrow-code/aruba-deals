'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import DealCard from '@/components/DealCard'
import CategoryFilter from '@/components/CategoryFilter'
import { getDeals } from '@/lib/queries'
import { Deal } from '@/lib/types'

function DealsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDeals(category || undefined)
      .then(setDeals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category])

  const filtered = deals.filter((deal) => {
    const matchesSearch =
      !searchQuery ||
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.business?.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.deal_price - b.deal_price
    if (sortBy === 'price-high') return b.deal_price - a.deal_price
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'discount') {
      const discountA = (a.original_price - a.deal_price) / a.original_price
      const discountB = (b.original_price - b.deal_price) / b.original_price
      return discountB - discountA
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            {category ? `${category} Deals` : 'All Deals in Aruba'}
          </h1>

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none text-gray-700 text-sm cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="discount">Most Discount</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <CategoryFilter activeCategory={category} />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              {sorted.length} deal{sorted.length !== 1 ? 's' : ''} found
              {category && ` in ${category}`}
            </p>

            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sorted.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🌊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No deals found</h3>
                <p className="text-gray-500">Try adjusting your search or browse all categories.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
      <DealsContent />
    </Suspense>
  )
}
