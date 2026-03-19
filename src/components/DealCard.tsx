'use client'

import Link from 'next/link'
import { Star, Clock, MapPin } from 'lucide-react'
import { Deal } from '@/lib/types'

const FALLBACK = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'

interface DealCardProps {
  deal: Deal
}

export default function DealCard({ deal }: DealCardProps) {
  const discount = Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
  const daysLeft = Math.ceil((new Date(deal.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const spotsLeft = deal.total_available - deal.vouchers_sold

  return (
    <Link href={`/deals/${deal.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative overflow-hidden h-44 sm:h-52">
        <img
          src={deal.images[0] || FALLBACK}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            -{discount}%
          </span>
        </div>
        {spotsLeft <= 5 && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {spotsLeft} left!
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <p className="text-white text-sm font-medium">{deal.business?.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 text-sm sm:text-lg leading-tight mb-1.5 sm:mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
          {deal.title}
        </h3>

        <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 flex-wrap">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 flex-shrink-0" />
            <span className="truncate max-w-[70px] sm:max-w-none">{deal.business?.location?.split(',')[0]}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
            <span>{daysLeft}d</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(deal.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-0.5 sm:ml-1">{deal.rating}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between gap-1">
          <div>
            <span className="text-lg sm:text-2xl font-bold text-orange-500">
              ${deal.deal_price}
            </span>
            <span className="text-gray-400 line-through text-xs sm:text-sm ml-1 sm:ml-2">
              ${deal.original_price}
            </span>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-colors flex-shrink-0">
            View
          </button>
        </div>
      </div>
    </Link>
  )
}
