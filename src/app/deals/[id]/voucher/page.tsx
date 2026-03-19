'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, MapPin, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getDeal } from '@/lib/queries'
import { Deal, Voucher } from '@/lib/types'
import QRCodeImage from '@/components/QRCodeImage'

function VoucherContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = searchParams.get('slot')

  const [deal, setDeal] = useState<Deal | null>(null)
  const [voucher, setVoucher] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/login?redirect=/deals/${params.id}/voucher`)
        return
      }

      const dealData = await getDeal(params.id as string)
      if (!dealData) {
        setError('Deal not found')
        setLoading(false)
        return
      }
      setDeal(dealData)

      // Check if user already has a voucher for this deal
      const { data: existing } = await supabase
        .from('vouchers')
        .select('*')
        .eq('deal_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        setVoucher(existing as Voucher)
      } else {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const res = await fetch('/api/create-voucher', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token ?? ''}`,
            },
            body: JSON.stringify({ dealId: params.id, bookingSlotId: slotId ?? null }),
          })
          const json = await res.json()
          if (!res.ok) {
            setError(json.error || 'Failed to create voucher. Please try again.')
          } else {
            setVoucher(json.voucher as Voucher)
          }
        } catch (err: any) {
          setError(err?.message || 'Failed to create voucher. Please try again.')
        }
      }

      setLoading(false)
    }

    init()
  }, [params.id, router, slotId])

  const handleCancelVoucher = async () => {
    if (!voucher || !deal) return
    setCancelling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/delete-voucher', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ voucherId: voucher.id, dealId: deal.id }),
      })
      if (res.ok) {
        router.push(`/deals/${deal.id}`)
      } else {
        setCancelling(false)
        setConfirmCancel(false)
      }
    } catch {
      setCancelling(false)
      setConfirmCancel(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Generating your voucher...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/deals" className="text-orange-500 font-semibold">Back to deals</Link>
        </div>
      </div>
    )
  }

  if (!deal || !voucher) return null

  const expiryDate = voucher.expires_at
    ? new Date(voucher.expires_at)
    : new Date(deal.expiration_date)
  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link href="/deals" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to deals
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Success header */}
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Deal Claimed!</h1>
            <p className="text-white/80 text-sm">Show this QR code at the business</p>
          </div>

          {/* QR Code */}
          <div className="p-8 text-center border-b border-dashed border-gray-200">
            <div className="inline-block bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
              <QRCodeImage value={voucher.qr_code} size={192} />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900 tracking-widest font-mono">{voucher.qr_code}</p>
              <p className="text-xs text-gray-400 mt-1">Voucher code</p>
            </div>
          </div>

          {/* Deal info */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Deal</p>
              <p className="font-bold text-gray-900">{deal.title}</p>
              <p className="text-sm text-gray-500">{deal.business?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-orange-600 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Valid for</span>
                </div>
                <p className="font-bold text-gray-900">{daysLeft} days</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-600 mb-1">You paid</p>
                <p className="font-bold text-gray-900">${deal.deal_price}</p>
                <p className="text-xs text-gray-400 line-through">${deal.original_price}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Redeem at</p>
                <p className="text-sm text-gray-500">{deal.location}</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                {voucher.expires_at ? 'Expires' : 'Valid until'}{' '}
                <strong className="text-gray-600">
                  {expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </strong>
              </p>
            </div>

            <Link
              href="/dashboard"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-center transition-colors"
            >
              View My Vouchers
            </Link>

            {/* Cancel voucher */}
            {voucher.status === 'active' && (
              <div>
                {!confirmCancel ? (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-2"
                  >
                    Cancel this voucher
                  </button>
                ) : (
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-700 font-medium mb-3 text-center">
                      Cancel voucher? The spot will open back up.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Keep Voucher
                      </button>
                      <button
                        onClick={handleCancelVoucher}
                        disabled={cancelling}
                        className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white transition-colors"
                      >
                        {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function VoucherPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    }>
      <VoucherContent />
    </Suspense>
  )
}
