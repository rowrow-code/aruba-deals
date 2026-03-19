'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, TrendingUp, Eye, CheckCircle, Tag, Trash2, Upload, X, AlertTriangle, Store, XCircle, Clock, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getMyBusiness, getBusinessDeals, createDeal } from '@/lib/queries'
import { Business, Deal } from '@/lib/types'

// ── Image uploader ──────────────────────────────────────────────────────────
function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const active = !value

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      const { url } = await res.json()
      onChange(url)
      setError(null)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Upload failed: ${err?.message || 'storage error'}. Paste a URL below instead.`)
    } finally {
      setUploading(false)
    }
  }

  // Global paste listener — only fires when NOT typing in an input/textarea
  useEffect(() => {
    if (!active) return
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return // let the field handle it

      const file = e.clipboardData?.files[0]
      if (file && file.type.startsWith('image/')) {
        upload(file)
        return
      }
      // Only accept URLs that look like images
      const text = e.clipboardData?.getData('text') || ''
      if (text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|avif|svg)/i)) {
        onChange(text.trim())
      }
    }
    document.addEventListener('paste', handleGlobalPaste)
    return () => document.removeEventListener('paste', handleGlobalPaste)
  }, [active])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [])

  const applyUrl = () => {
    const trimmed = urlInput.trim()
    if (trimmed.startsWith('http')) {
      onChange(trimmed)
      setUrlInput('')
      setError(null)
    } else if (trimmed) {
      setError('Please enter a valid image URL starting with http')
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative">
          <img src={value} alt="Deal preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
          <button
            type="button"
            onClick={() => { onChange(''); setError(null) }}
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <>
          {uploading ? (
            <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-orange-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Upload file */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                />
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">Upload image</p>
                <p className="text-xs text-gray-400 mt-0.5">Click or drag & drop</p>
              </div>

              {/* Option 2: Paste URL */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Paste URL</p>
                <p className="text-xs text-gray-400 mt-0.5">Ctrl+V or type below</p>
              </div>
            </div>
          )}

          {/* URL input — always visible */}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text')
                if (text.startsWith('http')) {
                  e.preventDefault()
                  onChange(text.trim())
                  setUrlInput('')
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyUrl())}
              placeholder="Paste image URL here (Ctrl+V)..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {urlInput && (
              <button
                type="button"
                onClick={applyUrl}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Use
              </button>
            )}
          </div>
        </>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function BusinessDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'create'>('overview')
  const [business, setBusiness] = useState<Business | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    original_price: '',
    deal_price: '',
    expiration_date: '',
    image_url: '',
    included: '',
    voucher_expiry_hours: '',
    time_slot_enabled: false,
    slots: [] as string[],
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [supportMessage, setSupportMessage] = useState('')
  const [sendingSupport, setSendingSupport] = useState(false)
  const [supportSent, setSupportSent] = useState(false)
  const [newSlotLabel, setNewSlotLabel] = useState('')

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
        console.error('Dashboard load error:', err)
        setLoadError(err instanceof Error ? err.message : 'Failed to load business data')
      } finally {
        setLoading(false)
      }
    })
  }, [router])

  const stats = {
    totalVouchersSold: deals.reduce((sum, d) => sum + d.vouchers_sold, 0),
    activeDeals: deals.filter((d) => d.is_active).length,
    totalRevenue: deals.reduce((sum, d) => sum + d.deal_price * d.vouchers_sold, 0),
    totalViews: deals.reduce((sum, d) => sum + (d.views ?? 0), 0),
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
        images: formData.image_url ? [formData.image_url] : [],
        voucher_expiry_hours: formData.voucher_expiry_hours ? Number(formData.voucher_expiry_hours) : null,
        time_slot_enabled: formData.time_slot_enabled,
      })

      // Insert booking slots if enabled
      if (formData.time_slot_enabled && formData.slots.length > 0) {
        await supabase.from('booking_slots').insert(
          formData.slots.map((label) => ({
            deal_id: newDeal.id,
            slot_label: label,
            max_capacity: 1,
            is_active: true,
          }))
        )
      }

      setDeals((prev) => [newDeal, ...prev])
      setSubmitted(true)
      setFormData({ title: '', description: '', original_price: '', deal_price: '', expiration_date: '', image_url: '', included: '', voucher_expiry_hours: '', time_slot_enabled: false, slots: [] })

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

  const handleDeleteDeal = async (dealId: string) => {
    setDeletingId(dealId)
    try {
      const res = await fetch('/api/delete-deal', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Delete failed: ${err.error || 'Unknown error'}`)
      } else {
        setDeals((prev) => prev.filter((d) => d.id !== dealId))
      }
    } catch {
      alert('Delete failed: network error')
    }
    setConfirmDeleteId(null)
    setDeletingId(null)
  }

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return
    setSendingSupport(true)
    const { error } = await supabase
      .from('support_messages')
      .insert({ business_id: business.id, message: supportMessage })
    if (!error) {
      setSupportSent(true)
      setSupportMessage('')
    }
    setSendingSupport(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-yellow-500" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-2">{loadError}</p>
          <p className="text-xs text-gray-400 mb-6">Try signing out and back in, then visit this page again.</p>
          <a href="/business/dashboard" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            Retry
          </a>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Store className="w-8 h-8 text-gray-400" /></div>
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
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4"><Clock className="w-8 h-8 text-yellow-500" /></div>
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
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-400" /></div>
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
            <div className="flex items-center gap-2">
              <Link
                href="/business/redeem"
                className="flex items-center gap-2 border border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-500 font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Redeem Voucher
              </Link>
              <button
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Deal
              </button>
            </div>
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

            {/* Contact Support */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-6">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Contact Support</h2>
              <p className="text-gray-500 text-sm mb-4">Send a message to the ArubaSave admin team</p>
              {supportSent ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Message sent! We'll get back to you soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSendSupport} className="space-y-3">
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your question or issue..."
                    rows={4}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingSupport || !supportMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {sendingSupport ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Deals tab */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            {deals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><ClipboardList className="w-6 h-6 text-gray-400" /></div>
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
                const isConfirming = confirmDeleteId === deal.id
                return (
                  <div key={deal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 flex items-center gap-4">
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
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${(deal.deal_price * deal.vouchers_sold).toFixed(0)}</div>
                          <div className="text-xs text-gray-500">revenue</div>
                        </div>
                        {!isConfirming && (
                          <button
                            onClick={() => setConfirmDeleteId(deal.id)}
                            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 font-semibold px-3 py-2 rounded-xl text-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline confirmation */}
                    {isConfirming && (
                      <div className="border-t border-red-100 bg-red-50 px-5 py-4 flex items-center justify-between gap-4">
                        <p className="text-sm text-red-700 font-medium">Remove <strong>{deal.title}</strong>? This cannot be undone.</p>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            disabled={deletingId === deal.id}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white transition-colors"
                          >
                            {deletingId === deal.id ? 'Removing...' : 'Yes, Remove'}
                          </button>
                        </div>
                      </div>
                    )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Voucher Expiry</label>
                    <select
                      value={formData.voucher_expiry_hours}
                      onChange={(e) => setFormData({ ...formData, voucher_expiry_hours: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      <option value="">No expiry (use deal date)</option>
                      <option value="24">24 hours after claiming</option>
                      <option value="72">72 hours after claiming</option>
                      <option value="168">7 days after claiming</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.time_slot_enabled}
                        onChange={(e) => setFormData({ ...formData, time_slot_enabled: e.target.checked, slots: [] })}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable time slot booking</span>
                    </label>
                  </div>

                  {formData.time_slot_enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Slots</label>
                      <div className="space-y-2 mb-2">
                        {formData.slots.map((slot, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-sm">
                            <span className="flex-1 text-gray-700">{slot}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, slots: formData.slots.filter((_, idx) => idx !== i) })}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSlotLabel}
                          onChange={(e) => setNewSlotLabel(e.target.value)}
                          placeholder="e.g. Monday 10:00 AM"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newSlotLabel.trim()) {
                                setFormData({ ...formData, slots: [...formData.slots, newSlotLabel.trim()] })
                                setNewSlotLabel('')
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSlotLabel.trim()) {
                              setFormData({ ...formData, slots: [...formData.slots, newSlotLabel.trim()] })
                              setNewSlotLabel('')
                            }
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                        >
                          Add Slot
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Deal Image</label>
                    <ImageUploader
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
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
