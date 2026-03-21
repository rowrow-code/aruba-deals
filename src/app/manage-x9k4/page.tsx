'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Building2, Tag, Trash2, Inbox, ClipboardList, Users, MessageSquare, CalendarDays, X, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Business, Deal } from '@/lib/types'

function AdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusId = searchParams.get('focus')
  const [activeTab, setActiveTab] = useState<'businesses' | 'deals' | 'users' | 'messages'>('businesses')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [allDeals, setAllDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [dealsLoading, setDealsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDeleteDealId, setConfirmDeleteDealId] = useState<string | null>(null)
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null)
  const [confirmDeleteBusinessId, setConfirmDeleteBusinessId] = useState<string | null>(null)
  const [deletingBusinessId, setDeletingBusinessId] = useState<string | null>(null)
  const focusedRef = useRef<HTMLDivElement | null>(null)

  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [userVoucherCounts, setUserVoucherCounts] = useState<Record<string, number>>({})

  const [expandedDealId, setExpandedDealId] = useState<string | null>(null)
  const [dealVouchers, setDealVouchers] = useState<Record<string, any[]>>({})
  const [dealVouchersLoading, setDealVouchersLoading] = useState<string | null>(null)

  const [showEarningsModal, setShowEarningsModal] = useState(false)
  const [earningsData, setEarningsData] = useState<{ month: string; total: number; count: number }[]>([])
  const [earningsLoading, setEarningsLoading] = useState(false)

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

  const handleTabChange = (tab: 'businesses' | 'deals' | 'users' | 'messages') => {
    setActiveTab(tab)
    if (tab === 'deals' && allDeals.length === 0) loadDeals()
    if (tab === 'users') loadUsers()
    if (tab === 'messages') loadMessages()
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
    const userList = data || []
    setUsers(userList)

    // Get active voucher counts
    const { data: vouchers } = await supabase
      .from('vouchers')
      .select('user_id')
      .eq('status', 'active')
    const counts: Record<string, number> = {}
    for (const v of (vouchers || [])) {
      counts[v.user_id] = (counts[v.user_id] || 0) + 1
    }
    setUserVoucherCounts(counts)
    setUsersLoading(false)
  }

  const loadMessages = async () => {
    setMessagesLoading(true)
    const { data } = await supabase
      .from('support_messages')
      .select('*, business:businesses(name)')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setMessagesLoading(false)
  }

  const markMessageRead = async (messageId: string) => {
    await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('id', messageId)
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, is_read: true } : m))
  }

  const loadDealVouchers = async (dealId: string) => {
    if (dealVouchers[dealId]) return // already loaded
    setDealVouchersLoading(dealId)
    const { data } = await supabase
      .from('vouchers')
      .select('*, profile:profiles(email, full_name)')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
    setDealVouchers((prev) => ({ ...prev, [dealId]: data || [] }))
    setDealVouchersLoading(null)
  }

  const toggleDealExpand = (dealId: string) => {
    if (expandedDealId === dealId) {
      setExpandedDealId(null)
    } else {
      setExpandedDealId(dealId)
      loadDealVouchers(dealId)
    }
  }

  const loadMonthlyEarnings = async () => {
    setEarningsLoading(true)
    const { data } = await supabase
      .from('vouchers')
      .select('created_at, deal:deals(deal_price)')

    const byMonth: Record<string, { total: number; count: number }> = {}
    for (const v of data || []) {
      const month = new Date(v.created_at).toISOString().slice(0, 7)
      if (!byMonth[month]) byMonth[month] = { total: 0, count: 0 }
      byMonth[month].total += (v.deal as any)?.deal_price ?? 0
      byMonth[month].count += 1
    }

    const sorted = Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, { total, count }]) => ({ month, total, count }))

    setEarningsData(sorted)
    setEarningsLoading(false)
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

  const adminFetch = async (body: object) => {
    const { data: { session } } = await supabase.auth.getSession()
    return fetch('/api/admin-delete-deal', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify(body),
    })
  }

  const handleDeleteBusiness = async (businessId: string) => {
    setDeletingBusinessId(businessId)
    try {
      const res = await adminFetch({ businessId })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch {}
      if (res.ok) {
        setBusinesses((prev) => prev.filter((b) => b.id !== businessId))
        setAllDeals((prev) => prev.filter((d) => d.business_id !== businessId))
      } else {
        alert(`Delete failed: ${data.error || text || 'Unknown error'}`)
      }
    } catch (e: any) {
      alert(`Delete failed: ${e?.message || 'network error'}`)
    }
    setConfirmDeleteBusinessId(null)
    setDeletingBusinessId(null)
  }

  const handleDeleteDeal = async (dealId: string) => {
    setDeletingDealId(dealId)
    try {
      const res = await adminFetch({ dealId })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch {}
      if (res.ok) {
        setAllDeals((prev) => prev.filter((d) => d.id !== dealId))
      } else {
        alert(`Delete failed: ${data.error || text || 'Unknown error'}`)
      }
    } catch (e: any) {
      alert(`Delete failed: ${e?.message || 'network error'}`)
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
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <p className="text-gray-500 text-sm">Review and manage business applications</p>
            </div>
            <button
              onClick={() => { setShowEarningsModal(true); loadMonthlyEarnings() }}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
            >
              <CalendarDays className="w-4 h-4" />
              Platform Earnings
            </button>
          </div>

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
            <button
              onClick={() => handleTabChange('users')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users
            </button>
            <button
              onClick={() => handleTabChange('messages')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'messages' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Messages
              {messages.filter(m => !m.is_read).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {messages.filter(m => !m.is_read).length}
                </span>
              )}
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
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><Inbox className="w-6 h-6 text-gray-400" /></div>
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

                    <div className="flex gap-2 flex-shrink-0">
                      {business.status === 'pending' && (
                        <>
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
                        </>
                      )}
                      {confirmDeleteBusinessId !== business.id && (
                        <button
                          onClick={() => setConfirmDeleteBusinessId(business.id)}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 font-semibold px-3 py-2 rounded-xl text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Remove business confirmation */}
                  {confirmDeleteBusinessId === business.id && (
                    <div className="border-t border-red-100 bg-red-50 px-6 py-4 flex items-center justify-between gap-4 mt-4 -mx-6 -mb-6 rounded-b-2xl">
                      <p className="text-sm text-red-700 font-medium">
                        Remove <strong>{business.name}</strong> and all their deals? This cannot be undone.
                      </p>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setConfirmDeleteBusinessId(null)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteBusiness(business.id)}
                          disabled={deletingBusinessId === business.id}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white transition-colors"
                        >
                          {deletingBusinessId === business.id ? 'Removing...' : 'Yes, Remove'}
                        </button>
                      </div>
                    </div>
                  )}
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
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><ClipboardList className="w-6 h-6 text-gray-400" /></div>
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
                    <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => !isConfirming && toggleDealExpand(deal.id)}>
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
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteDealId(deal.id) }}
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

                    {/* Expanded deal details */}
                    {expandedDealId === deal.id && !isConfirming && (
                      <div className="border-t border-gray-100 bg-gray-50 p-5">
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span><strong>{deal.views ?? 0}</strong> views</span>
                          <span><strong>{deal.vouchers_sold}</strong> vouchers sold</span>
                          <span><strong>${(deal.deal_price * deal.vouchers_sold).toFixed(0)}</strong> revenue</span>
                        </div>
                        {dealVouchersLoading === deal.id ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
                          </div>
                        ) : (dealVouchers[deal.id] || []).length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">No vouchers claimed yet</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Buyers</p>
                            {(dealVouchers[deal.id] || []).map((v: any) => (
                              <div key={v.id} className="flex items-center gap-3 bg-white rounded-xl p-3 text-sm">
                                <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {((v.profile as any)?.full_name || (v.profile as any)?.email || '?').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{(v.profile as any)?.full_name || '—'}</p>
                                  <p className="text-gray-500 text-xs truncate">{(v.profile as any)?.email}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    v.status === 'active' ? 'bg-green-50 text-green-600' :
                                    v.status === 'used' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'
                                  }`}>
                                    {v.status}
                                  </span>
                                  <p className="text-xs text-gray-400 mt-0.5">{new Date(v.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          usersLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">{users.length} registered customers</p>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user.full_name || '—'}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((slot) => {
                          const count = userVoucherCounts[user.id] || 0
                          const filled = slot <= count
                          return (
                            <div
                              key={slot}
                              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                                filled
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'bg-white border-gray-300'
                              }`}
                            />
                          )
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userVoucherCounts[user.id] || 0}/3 vouchers
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">No customers yet.</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Messages tab */}
        {activeTab === 'messages' && (
          messagesLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500">No support messages yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${!msg.is_read ? 'border-orange-200' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">{(msg.business as any)?.name || 'Unknown Business'}</p>
                        {!msg.is_read && (
                          <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!msg.is_read && (
                      <button
                        onClick={() => markMessageRead(msg.id)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>

    {/* Monthly Earnings Modal */}
    {showEarningsModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowEarningsModal(false)}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-white" />
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Platform Earnings</h2>
                <p className="text-white/70 text-xs">All businesses combined</p>
              </div>
            </div>
            <button onClick={() => setShowEarningsModal(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {earningsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : earningsData.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No earnings data yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {earningsData.map(({ month, total, count }) => {
                  const label = new Date(month + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  const maxTotal = earningsData[0]?.total || 1
                  const pct = (total / maxTotal) * 100
                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{count} sold</span>
                          <span className="text-sm font-bold text-gray-900">${total.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {earningsData.length > 0 && (
            <div className="px-6 pb-5 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
              <span>{earningsData.reduce((s, e) => s + e.count, 0)} vouchers total</span>
              <span className="font-semibold text-gray-600">
                All time: ${earningsData.reduce((s, e) => s + e.total, 0).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    )}
    </>
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
