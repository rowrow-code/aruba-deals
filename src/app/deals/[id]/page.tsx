'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Clock, CheckCircle, ArrowLeft, Share2, Heart, Users } from 'lucide-react'
import { getDeal } from '@/lib/queries'
import { supabase } from '@/lib/supabase'
import { Deal } from '@/lib/types'

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeImage, setActiveImage] = useState(0)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      getDeal(params.id as string)
        .then(setDeal)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal not found</h2>
          <Link href="/deals" className="text-orange-500 hover:text-orange-600 font-medium">
            Browse all deals
          </Link>
        </div>
      </div>
    )
  }

  const discount = Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
  const daysLeft = Math.ceil((new Date(deal.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const spotsLeft = deal.total_available - deal.vouchers_sold

  const handleClaimDeal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push(`/deals/${deal.id}/voucher`)
    } else {
      router.push(`/auth/login?redirect=/deals/${deal.id}/voucher`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/deals" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to deals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column - Images + Details */}
          <div className="lg:col-span-3">
            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden h-80 sm:h-96 mb-3">
              <img
                src={deal.images[activeImage]}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-orange-500 text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">
                  Save {discount}%
                </span>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow">
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {deal.images.length > 1 && (
              <div className="flex gap-2 mb-6">
                {deal.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`rounded-xl overflow-hidden h-16 w-20 flex-shrink-0 transition-all ${
                      activeImage === i ? 'ring-2 ring-orange-500' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Business */}
            <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{deal.business?.name}</h2>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4 text-orange-400" />
                {deal.location}
              </div>
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                {deal.business?.category}
              </span>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-3">{deal.title}</h3>
              <p className="text-gray-600 leading-relaxed">{deal.description}</p>
            </div>

            {/* What's included */}
            <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4">What&apos;s Included</h3>
              <ul className="space-y-2.5">
                {deal.included.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column - Purchase card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(deal.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{deal.rating}</span>
                <span className="text-gray-400 text-sm">rating</span>
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-orange-500">${deal.deal_price}</span>
                  <span className="text-gray-400 line-through text-xl">${deal.original_price}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="bg-green-50 text-green-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                    You save ${(deal.original_price - deal.deal_price).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Info badges */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-orange-500" />
                  </div>
                  <span>Valid for <strong>{daysLeft} more days</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <span><strong>{spotsLeft} spots</strong> remaining</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-orange-500" />
                  </div>
                  <span>{deal.location}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{deal.vouchers_sold} claimed</span>
                  <span>{spotsLeft} left</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                    style={{ width: `${(deal.vouchers_sold / deal.total_available) * 100}%` }}
                  />
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleClaimDeal}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-orange-200 active:scale-95"
              >
                Claim This Deal
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Free to claim • Digital QR voucher
              </p>

              {/* Validity */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
                Valid until{' '}
                <strong className="text-gray-700">
                  {new Date(deal.expiration_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
