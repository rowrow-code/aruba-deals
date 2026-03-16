'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Business } from '@/lib/types'

export default function AdminPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check admin role
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
  }, [router])

  const loadBusinesses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })
    setBusinesses((data as Business[]) || [])
    setLoading(false)
  }

  const handleAction = async (business: Business, action: 'approved' | 'rejected') => {
    setActionLoading(business.id)

    const { error } = await supabase
      .from('businesses')
      .update({ status: action })
      .eq('id', business.id)

    if (!error) {
      // Notify the business by email
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

          {/* Stats */}
          <div className="flex gap-3 mt-5">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === tab
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  filter === tab ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                }`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} applications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((business) => (
              <div key={business.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
        )}
      </div>
    </div>
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
