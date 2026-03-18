'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Building2, Tag, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Business, Deal } from '@/lib/types'

function AdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusId = searchParams.get('focus')
  const [activeTab, setActiveTab] = useState<'businesses' | 'deals'>('businesses')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [allDeals, setAllDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [dealsLoading, setDealsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDeleteDealId, setConfirmDeleteDealId] = useState<string | null>(null)
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null)
  const focusedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (focusId) setFilter('all')

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      await loadBusinesses()
    })
  }, [router, focusId])

  useEffect(() => {
    if (!loading && focusId && focusedRef.current) {
      focusedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [loading, focusId])

  const loadBusinesses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })
    setBusinesses((data as Business[]) || [])
    setLoading(false)
  }

  const loadDeals = async () => {
    setDealsLoading(true)
    const { data } = await supabase
      .from('deals')
      .select('*, business:businesses(name)')
      .order('created_at', { ascending: false })
    setAllDeals((data as Deal[]) || [])
    setDealsLoading(false)
  }

  const handleTabChange = (tab: 'businesses' | 'deals') => {
    setActiveTab(tab)
    if (tab === 'deals' && allDeals.length === 0) loadDeals()
  }

  const handleAction = async (business: Business, action: 'approved' | 'rejected') => {
    setActionLoading(business.id)

    const { error } = await supabase
      .from('businesses')
      .update({ status: action })
      .eq('id', business.id)

    if (!error) {
      await fetch('/api/notify-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: business.name,
          contactEmail: business.contact_email,
          status: action,
        }),
      })

      setBusinesses((prev) =>
        prev.map((b) => (b.id === business.id ? { ...b, status: action } : b))
      )
    }

    setActionLoading(null)
  }

  const handleDeleteDeal = async (dealId: string) => {
    setDeletingDealId(dealId)
    const { error } = await supabase.from('deals').delete().eq('id', dealId)
    if (!error) {
      setAllDeals((prev) => prev.filter((d) => d.id !== dealId))
    }
    setConfirmDeleteDealId(null)
    setDeletingDealId(null)
  }

  const filtered = filter === 'all' ? businesses : businesses.filter((b) => b.status === filter)

  const counts = {
    all: businesses.length,
    pending: businesses.filter((b) => b.status === 'pending').length,
    approved: businesses.filter((b) => b.status === 'approved').length,
    rejected: businesses.filter((b) => b.status === 'rejected').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-500 text-sm">Review and manage business applications</p>

          {/* Main tabs */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => handleTabChange('businesses')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'businesses' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Businesses
            </button>
            <button
              onClick={() => handleTabChange('deals')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'deals' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Deals
            </button>
          </div>

          {/* Business filter tabs */}
          {activeTab === 'businesses' && (
            <div className="flex gap-3 mt-4">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === tab
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    filter === tab ? 'bg-orange-200 text-orange-800' : 'bg-white text-gray-700'
                  }`}>
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Businesses tab */}
        {activeTab === 'businesses' && (
          filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500">No {filter === 'all' ? '' : filter} applications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((business) => (
                <div
                  key={business.id}
                  id={`business-${business.id}`}
                  ref={business.id === focusId ? focusedRef : null}
                  className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                    business.id === focusId
                      ? 'border-orange-400 ring-2 ring-orange-300 ring-offset-2'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-lg font-bold text-gray-900">{business.name}</h2>
                        <StatusBadge status={business.status} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs mb-0.5">Category</p>
                          <p className="font-medium text-gray-700">{business.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-0.5">Location</p>
                          <p className="font-medium text-gray-700">{business.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-0.5">Contact</p>
                          <p className="font-medium text-gray-700">{business.contact_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-0.5">Phone</p>
                          <p className="font-medium text-gray-700">{business.phone || '—'}</p>
                        </div>
                      </div>
                      {business.contact_email && (
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="text-gray-400">Email: </span>
                          <a href={`mailto:${business.contact_email}`} className="text-orange-500 hover:underline">
                            {business.contact_email}
                          </a>
                        </p>
                      )}
                      {business.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{business.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-3">
                        Applied {new Date(business.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {business.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAction(business, 'approved')}
                          disabled={actionLoading === business.id}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(business, 'rejected')}
                          disabled={actionLoading === business.id}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Deals tab */}
        {activeTab === 'deals' && (
          dealsLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : allDeals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500">No deals posted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allDeals.map((deal) => {
                const isConfirming = confirmDeleteDealId === deal.id
                const discount = deal.original_price > 0
                  ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
                  : 0
                return (
                  <div key={deal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 flex items-center gap-4">
                      {deal.images?.[0] && (
                        <img src={deal.images[0]} alt={deal.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{deal.title}</h3>
                        <p className="text-sm text-orange-500 font-medium mt-0.5">
                          {(deal.business as unknown as { name: string })?.name || '—'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span>${deal.deal_price} {discount > 0 ? `(${discount}% off)` : ''}</span>
                          <span>{deal.vouchers_sold} sold</span>
                          <span className={`font-medium ${deal.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                            {deal.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      {!isConfirming && (
                        <button
                          onClick={() => setConfirmDeleteDealId(deal.id)}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 font-semibold px-3 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Inline confirmation */}
                    {isConfirming && (
                      <div className="border-t border-red-100 bg-red-50 px-5 py-4 flex items-center justify-between gap-4">
                        <p className="text-sm text-red-700 font-medium">
                          Remove <strong>{deal.title}</strong>? This cannot be undone.
                        </p>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setConfirmDeleteDealId(null)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            disabled={deletingDealId === deal.id}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white transition-colors"
                          >
                            {deletingDealId === deal.id ? 'Removing...' : 'Yes, Remove'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminContent />
    </Suspense>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3 h-3" /> Approved
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="flex items-center gap-1 bg-red-50 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 bg-yellow-50 text-yellow-600 text-xs font-semibold px-2.5 py-1 rounded-full">
      <Clock className="w-3 h-3" /> Pending
    </span>
  )
}
