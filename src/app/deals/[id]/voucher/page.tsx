'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, MapPin, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getDeal, createVoucher } from '@/lib/queries'
import { Deal, Voucher } from '@/lib/types'
import QRCodeImage from '@/components/QRCodeImage'

export default function VoucherPage() {
  const params = useParams()
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [voucher, setVoucher] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          const newVoucher = await createVoucher(params.id as string, user.id)
          setVoucher(newVoucher)
        } catch (err) {
          setError('Failed to create voucher. Please try again.')
        }
      }

      setLoading(false)
    }

    init()
  }, [params.id, router])

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
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/deals" className="text-orange-500 font-semibold">Back to deals</Link>
        </div>
      </div>
    )
  }

  if (!deal || !voucher) return null

  const daysLeft = Math.ceil((new Date(deal.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

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
                Valid until{' '}
                <strong className="text-gray-600">
                  {new Date(deal.expiration_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </strong>
              </p>
            </div>

            <Link
              href="/dashboard"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-center transition-colors"
            >
              View My Vouchers
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
