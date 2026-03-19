'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, CheckCircle, AlertCircle, Lock, Camera, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getMyBusiness } from '@/lib/queries'
import { Business } from '@/lib/types'

const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false })

type RedeemResult =
  | { type: 'success'; dealTitle: string }
  | { type: 'error'; message: string }

export default function RedeemPage() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<RedeemResult | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [scanMode, setScanMode] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
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

      if (profile?.role !== 'business') {
        router.push('/')
        return
      }

      setUserId(user.id)
      const biz = await getMyBusiness(user.id)
      setBusiness(biz)
      setLoading(false)
    })
  }, [router])

  const redeemCode = async (rawCode: string) => {
    if (!business || !userId) return
    const trimmed = rawCode.toUpperCase().trim()
    if (!trimmed) return

    setSubmitting(true)
    setResult(null)

    const { data: voucher, error } = await supabase
      .from('vouchers')
      .select('*, deal:deals(*, business:businesses(*))')
      .eq('qr_code', trimmed)
      .maybeSingle()

    if (error || !voucher) {
      setResult({ type: 'error', message: 'Voucher not found. Check the code and try again.' })
      setSubmitting(false)
      return
    }

    const deal = voucher.deal as { title: string; business: { owner_id: string } }

    if (deal.business.owner_id !== userId) {
      setResult({ type: 'error', message: 'This voucher is for a different business.' })
      setSubmitting(false)
      return
    }

    if (voucher.status !== 'active') {
      setResult({ type: 'error', message: 'This voucher has already been used.' })
      setSubmitting(false)
      return
    }

    const { error: updateError } = await supabase
      .from('vouchers')
      .update({ status: 'used' })
      .eq('id', voucher.id)

    if (updateError) {
      setResult({ type: 'error', message: 'Failed to redeem voucher. Please try again.' })
    } else {
      setResult({ type: 'success', dealTitle: deal.title })
      setCode('')
      setScanMode(false)
    }

    setSubmitting(false)
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    await redeemCode(code)
  }

  const handleQRScan = async (scannedCode: string) => {
    setScanMode(false)
    setCode(scannedCode)
    await redeemCode(scannedCode)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!business || business.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-6">Your business must be approved to redeem vouchers.</p>
          <Link href="/business/dashboard" className="text-orange-500 font-semibold">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/business/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Redeem Voucher</h1>
          <p className="text-gray-500 mt-1">{business.name}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-lg mb-2">Enter Voucher Code</h2>
          <p className="text-gray-500 text-sm mb-6">Scan the customer&apos;s QR code or type the code manually</p>

          {/* QR Scanner */}
          {scanMode && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Point camera at QR code</p>
                <button
                  type="button"
                  onClick={() => { setScanMode(false); setScanError(null) }}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
              <QRScanner
                onScan={handleQRScan}
                onError={(err) => { setScanError(err); setScanMode(false) }}
              />
              {scanError && (
                <p className="text-sm text-red-600 mt-2">{scanError}</p>
              )}
            </div>
          )}

          {/* Scan button */}
          {!scanMode && (
            <button
              type="button"
              onClick={() => { setScanMode(true); setScanError(null); setResult(null) }}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-300 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold py-4 rounded-xl transition-colors mb-4"
            >
              <Camera className="w-5 h-5" />
              Scan QR Code with Camera
            </button>
          )}

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or enter code manually</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleRedeem} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ARUBA-XXXXXX"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-lg tracking-widest uppercase text-center"
            />

            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200"
            >
              {submitting ? 'Checking...' : 'Redeem Voucher'}
            </button>
          </form>

          {result && (
            <div className={`mt-4 rounded-xl p-4 flex items-start gap-3 ${result.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                {result.type === 'success' ? (
                  <>
                    <p className="font-semibold text-green-800">Voucher marked as used</p>
                    <p className="text-green-700 text-sm mt-0.5">{result.dealTitle}</p>
                  </>
                ) : (
                  <p className="text-red-700 font-medium">{result.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
