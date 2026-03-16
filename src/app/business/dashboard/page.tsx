'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, Eye, CheckCircle, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getMyBusiness, getBusinessDeals, createDeal } from '@/lib/queries'
import { Business, Deal } from '@/lib/types'

export default function BusinessDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'create'>('overview')
  const [business, setBusiness] = useState<Business | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    original_price: '',
    deal_price: '',
    expiration_date: '',
    included: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        const biz = await getMyBusiness(user.id)
        setBusiness(biz)
        if (biz) {
          const bizDeals = await getBusinessDeals(biz.id)
          setDeals(bizDeals)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })
  }, [router])

  const stats = {
    totalVouchersSold: deals.reduce((sum, d) => sum + d.vouchers_sold, 0),
    activeDeals: deals.filter((d) => d.is_active).length,
    totalRevenue: deals.reduce((sum, d) => sum + d.deal_price * d.vouchers_sold, 0),
    totalViews: deals.length * 160,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const newDeal = await createDeal({
        business_id: business.id,
        title: formData.title,
        description: formData.description,
        original_price: Number(formData.original_price),
        deal_price: Number(formData.deal_price),
        expiration_date: new Date(formData.expiration_date).toISOString(),
        included: formData.included.split('\n').map((s) => s.trim()).filter(Boolean),
        location: business.location,
      })

      setDeals((prev) => [newDeal, ...prev])
      setSubmitted(true)
      setFormData({ title: '', description: '', original_price: '', deal_price: '', expiration_date: '', included: '' })

      setTimeout(() => {
        setSubmitted(false)
        setActiveTab('deals')
      }, 2000)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No business found</h2>
          <p className="text-gray-500 mb-6">You don&apos;t have a business registered yet.</p>
          <a
            href="/business/register"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Register Your Business
          </a>
        </div>
      </div>
    )
  }

  if (business.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-500 mb-2">
            Thank you for registering <strong>{business.name}</strong>.
          </p>
          <p className="text-gray-500">We&apos;ll review your application and email you within 24 hours.</p>
        </div>
      </div>
    )
  }

  if (business.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
          <p className="text-gray-500 mb-6">
            Unfortunately, your application for <strong>{business.name}</strong> was not approved.
            Please contact us at storeroro07@gmail.com for more information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Business Dashboard</div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full mt-2 inline-block">
                {business.category}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Deal
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {(['overview', 'deals', 'create'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'create' ? '+ Create Deal' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Vouchers Sold', value: stats.totalVouchersSold, icon: Tag, color: 'bg-orange-50 text-orange-500' },
                { label: 'Active Deals', value: stats.activeDeals, icon: CheckCircle, color: 'bg-green-50 text-green-500' },
                { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-500' },
                { label: 'Profile Views', value: stats.totalViews, icon: Eye, color: 'bg-purple-50 text-purple-500' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                )
              })}
            </div>

            {deals.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Your Deals Performance</h2>
                <div className="space-y-4">
                  {deals.map((deal) => {
                    const progress = (deal.vouchers_sold / deal.total_available) * 100
                    return (
                      <div key={deal.id} className="flex items-center gap-4">
                        {deal.images?.[0] && (
                          <img src={deal.images[0]} alt={deal.title} className="w-12 h-12 rounded-xl object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{deal.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{deal.vouchers_sold}/{deal.total_available}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-gray-900">${(deal.deal_price * deal.vouchers_sold).toFixed(0)}</div>
                          <div className="text-xs text-gray-500">earned</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deals tab */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            {deals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 mb-4">No deals yet. Create your first deal!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Create Deal
                </button>
              </div>
            ) : (
              deals.map((deal) => {
                const discount = Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
                return (
                  <div key={deal.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    {deal.images?.[0] && (
                      <img src={deal.images[0]} alt={deal.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{deal.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${deal.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {deal.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>${deal.deal_price} (save {discount}%)</span>
                        <span>{deal.vouchers_sold} sold</span>
                        <span>{deal.total_available - deal.vouchers_sold} remaining</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-gray-900">${(deal.deal_price * deal.vouchers_sold).toFixed(0)}</div>
                      <div className="text-xs text-gray-500">revenue</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Create Deal tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Deal Created!</h2>
                <p className="text-gray-500">Your deal is now live on ArubaSave.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-xl mb-6">Create New Deal</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Deal Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Fresh Fish Platter for 2"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what customers will experience..."
                      required
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price ($) *</label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                        placeholder="0.00"
                        required
                        min="0"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Deal Price ($) *</label>
                      <input
                        type="number"
                        value={formData.deal_price}
                        onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
                        placeholder="0.00"
                        required
                        min="0"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {formData.original_price && formData.deal_price && (
                    <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-medium">
                      Customers save {Math.round(((Number(formData.original_price) - Number(formData.deal_price)) / Number(formData.original_price)) * 100)}% — ${(Number(formData.original_price) - Number(formData.deal_price)).toFixed(2)} off
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid Until *</label>
                    <input
                      type="date"
                      value={formData.expiration_date}
                      onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">What&apos;s Included</label>
                    <textarea
                      value={formData.included}
                      onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                      placeholder="List what's included, one per line..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200"
                  >
                    {submitting ? 'Publishing...' : 'Publish Deal'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
