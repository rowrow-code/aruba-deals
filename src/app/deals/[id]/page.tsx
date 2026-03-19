'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Clock, CheckCircle, ArrowLeft, Share2, Heart, Users, Search } from 'lucide-react'
import { getDeal, getDealReviews, submitReview, incrementDealViews } from '@/lib/queries'
import { supabase } from '@/lib/supabase'
import { Deal, Review } from '@/lib/types'

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reviewsRef = useRef<HTMLDivElement>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [hasUsedVoucher, setHasUsedVoucher] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    if (!params.id) return

    const dealId = params.id as string

    // Load deal + reviews in parallel
    Promise.all([
      getDeal(dealId),
      getDealReviews(dealId),
      supabase.auth.getUser(),
    ]).then(async ([dealData, reviewsData, { data: { user } }]) => {
      setDeal(dealData)
      setReviews(reviewsData)
      // Increment view count (fire-and-forget)
      incrementDealViews(dealId).catch(() => {})

      if (user) {
        setUserId(user.id)

        // Get user's name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile?.full_name) setUserName(profile.full_name)

        // Check if user has a used voucher for this deal
        const { data: voucher } = await supabase
          .from('vouchers')
          .select('id')
          .eq('deal_id', dealId)
          .eq('user_id', user.id)
          .eq('status', 'used')
          .maybeSingle()
        setHasUsedVoucher(!!voucher)

        // Check if user already reviewed
        const existing = reviewsData.find((r) => r.user_id === user.id) || null
        setExistingReview(existing)
        if (existing) {
          setReviewRating(existing.rating)
          setReviewComment(existing.comment || '')
        }
      }

      setLoading(false)
    }).catch((err) => {
      console.error(err)
      setLoading(false)
    })

    // Scroll to reviews if #reviews in URL
    if (window.location.hash === '#reviews') {
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 600)
    }
  }, [params.id])

  const handleClaimDeal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push(`/deals/${deal!.id}/voucher`)
    } else {
      router.push(`/auth/login?redirect=/deals/${deal!.id}/voucher`)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !deal || reviewRating === 0) return
    setSubmittingReview(true)

    try {
      const saved = await submitReview({
        deal_id: deal.id,
        user_id: userId,
        user_name: userName || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment,
      })

      setReviews((prev) => {
        const filtered = prev.filter((r) => r.user_id !== userId)
        return [saved, ...filtered]
      })
      setExistingReview(saved)
      setReviewSuccess(true)
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingReview(false)
    }
  }

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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
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
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : deal.rating

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

            {/* ── Reviews ─────────────────────────────────────────── */}
            <div ref={reviewsRef} id="reviews" className="bg-white rounded-2xl p-5 border border-gray-100 scroll-mt-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-lg">Reviews</h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({reviews.length})</span>
                  </div>
                )}
              </div>

              {/* Review form — only for users with a used voucher */}
              {hasUsedVoucher && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    {existingReview ? 'Update your review' : 'Share your experience'}
                  </p>
                  <form onSubmit={handleSubmitReview}>
                    {/* Star picker */}
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= (hoverRating || reviewRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 fill-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="ml-2 text-sm text-gray-500 self-center">
                          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell others about your experience (optional)..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white"
                    />
                    {reviewSuccess && (
                      <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Review saved!
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submittingReview || reviewRating === 0}
                      className="mt-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {submittingReview ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">⭐</div>
                  <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {review.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{review.user_name}</span>
                            {review.user_id === userId && (
                              <span className="text-xs bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full font-medium">You</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                              {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 ml-11 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                      className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                {reviews.length > 0 && (
                  <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                )}
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
