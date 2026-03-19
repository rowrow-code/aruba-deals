'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { UtensilsCrossed, Waves, Sparkles, Music, Dumbbell, Grid3X3 } from 'lucide-react'

const categories = [
  { name: 'All', icon: Grid3X3, color: 'bg-gray-100 text-gray-700' },
  { name: 'Restaurants', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600' },
  { name: 'Activities', icon: Waves, color: 'bg-blue-100 text-blue-600' },
  { name: 'Spa & Wellness', icon: Sparkles, color: 'bg-pink-100 text-pink-600' },
  { name: 'Nightlife', icon: Music, color: 'bg-purple-100 text-purple-600' },
  { name: 'Fitness', icon: Dumbbell, color: 'bg-green-100 text-green-600' },
]

interface CategoryFilterProps {
  activeCategory?: string
}

export default function CategoryFilter({ activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === 'All') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`/deals?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = (cat.name === 'All' && !activeCategory) || cat.name === activeCategory
        return (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium whitespace-nowrap transition-all text-sm ${
              isActive
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : `${cat.color} hover:opacity-80`
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
