'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QrCode, Calendar, CheckCircle, Clock, ArrowRight, Tag, User, Trash2, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getMyVouchers } from '@/lib/queries'
import { Voucher } from '@/lib/types'
import QRCodeImage from '@/components/QRCodeImage'

export default function DashboardPage() {
  const router = useRouter()
  const [activeVoucher, setActiveVoucher] = useState<string | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUserEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) setUserName(profile.full_name)

      try {
        const data = await getMyVouchers(user.id)
        setVouchers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })
  }, [router])

  const handleRemoveVoucher = async (voucherId: string, dealId: string) => {
    setRemovingId(voucherId)

    // Delete the voucher
    const { error } = await supabase.from('vouchers').delete().eq('id', voucherId)

    if (!error) {
      // Decrement vouchers_sold so the spot opens back up
      const { data: dealData } = await supabase
        .from('deals')
        .select('vouchers_sold')
        .eq('id', dealId)
        .single()

      if (dealData && dealData.vouchers_sold > 0) {
        await supabase
          .from('deals')
          .update({ vouchers_sold: dealData.vouchers_sold - 1 })
          .eq('id', dealId)
      }

      setVouchers((prev) => prev.filter((v) => v.id !== voucherId))
    }

    setConfirmRemoveId(null)
    setRemovingId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const activeVouchers = vouchers.filter((v) => v.status === 'active')
  const usedVouchers = vouchers.filter((v) => v.status === 'used')
  const totalSaved = vouchers.reduce(
    (sum, v) => sum + ((v.deal?.original_price ?? 0) - (v.deal?.deal_price ?? 0)),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userName || 'My Deals'}</h1>
              <p className="text-gray-500">{userEmail}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Vouchers', value: activeVouchers.length, icon: QrCode, color: 'text-orange-500 bg-orange-50' },
              { label: 'Deals Used', value: usedVouchers.length, icon: CheckCircle, color: 'text-green-500 bg-green-50' },
              { label: 'Total Saved', value: `$${totalSaved.toFixed(0)}`, icon: Tag, color: 'text-purple-500 bg-purple-50' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Vouchers */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Vouchers</h2>
        {activeVouchers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-10">
            <div className="text-4xl mb-3">🎫</div>
            <p className="text-gray-500">No active vouchers yet.</p>
            <Link href="/deals" className="text-orange-500 hover:text-orange-600 font-semibold text-sm mt-2 inline-block">
              Browse deals →
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            {activeVouchers.map((voucher) => {
              const deal = voucher.deal
              if (!deal) return null
              const daysLeft = Math.ceil((new Date(deal.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const isExpanded = activeVoucher === voucher.id
              const isConfirming = confirmRemoveId === voucher.id

              return (
                <div key={voucher.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer"
                    onClick={() => !isConfirming && setActiveVoucher(isExpanded ? null : voucher.id)}
                  >
                    {deal.images?.[0] && (
                      <img
                        src={deal.images[0]}
                        alt={deal.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-orange-500 font-semibold">{deal.business?.name}</p>
                      <h3 className="font-bold text-gray-900 truncate">{deal.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {daysLeft} days left
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          Active
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="bg-orange-50 text-orange-600 p-2 rounded-xl hover:bg-orange-100 transition-colors"
                        onClick={() => setActiveVoucher(isExpanded ? null : voucher.id)}>
                        <QrCode className="w-5 h-5" />
                      </button>
                      {!isConfirming && (
                        <button
                          onClick={() => setConfirmRemoveId(voucher.id)}
                          className="bg-red-50 text-red-400 p-2 rounded-xl hover:bg-red-100 transition-colors"
                          title="Remove voucher"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline remove confirmation */}
                  {isConfirming && (
                    <div className="border-t border-red-100 bg-red-50 px-5 py-4 flex items-center justify-between gap-4">
                      <p className="text-sm text-red-700 font-medium">Remove this voucher? The spot will go back to the deal.</p>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setConfirmRemoveId(null)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRemoveVoucher(voucher.id, deal.id)}
                          disabled={removingId === voucher.id}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white transition-colors"
                        >
                          {removingId === voucher.id ? 'Removing...' : 'Yes, Remove'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded QR View */}
                  {isExpanded && !isConfirming && (
                    <div className="border-t border-gray-100 p-6 bg-orange-50">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">Show this QR code at <strong>{deal.business?.name}</strong></p>
                        <div className="inline-block bg-white p-4 rounded-2xl shadow-sm mb-4">
                          <QRCodeImage value={voucher.qr_code} size={160} />
                          <p className="text-center text-sm font-mono font-bold text-gray-900 mt-3 tracking-widest">
                            {voucher.qr_code}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-sm text-gray-600">
                          Valid until{' '}
                          <strong>
                            {new Date(deal.expiration_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Used Vouchers */}
        {usedVouchers.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Used Vouchers</h2>
            <div className="space-y-4 mb-10">
              {usedVouchers.map((voucher) => {
                const deal = voucher.deal
                if (!deal) return null
                return (
                  <div key={voucher.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-4">
                      {deal.images?.[0] && (
                        <img
                          src={deal.images[0]}
                          alt={deal.title}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 grayscale opacity-70"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-semibold">{deal.business?.name}</p>
                        <h3 className="font-bold text-gray-700">{deal.title}</h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Used
                        </div>
                      </div>
                      <Link
                        href={`/deals/${deal.id}#reviews`}
                        className="flex items-center gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold px-3 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
                      >
                        <Star className="w-4 h-4" />
                        Review
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Browse more */}
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Discover More Deals</h3>
          <p className="text-orange-100 text-sm mb-4">New deals added every week</p>
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 bg-white text-orange-500 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors"
          >
            Browse Deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
