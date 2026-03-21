'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, Store } from 'lucide-react'

const categories = ['Restaurants', 'Activities', 'Spa & Wellness', 'Nightlife', 'Fitness', 'Other']

export default function BusinessRegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    location: '',
    description: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [emailWarning, setEmailWarning] = useState(false)

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // All auth + DB logic handled server-side to avoid RLS issues
      const res = await fetch('/api/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          contactName: formData.contactName,
          businessName: formData.businessName,
          category: formData.category,
          location: formData.location,
          description: formData.description,
          phone: formData.phone,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Something went wrong. Please try again.')
      const bizData = { id: result.businessId }

      // New users always need email confirmation
      setNeedsConfirmation(true)

      // Send email notification to admin
      const adminRes = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bizData?.id,
          businessName: formData.businessName,
          category: formData.category,
          location: formData.location,
          contactName: formData.contactName,
          contactEmail: formData.email,
          phone: formData.phone,
        }),
      })

      if (!adminRes.ok) {
        setEmailWarning(true)
      }

      setStep(4)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="ArubaSave" width={56} height={56} className="rounded-2xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900">List Your Business</h1>
            <p className="text-gray-500 mt-1">Join ArubaSave and reach more customers</p>
          </div>

          {step < 4 && (
            <>
              {/* Progress */}
              <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-orange-500' : 'bg-gray-100'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400 text-right -mt-6 mb-6">Step {step} of 3</p>
            </>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Business Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your business name"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location in Aruba *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Palm Beach, Eagle Beach, Oranjestad..."
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your business..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200">
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Contact Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Full name"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="business@example.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+297..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200">
                Continue
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-bold text-gray-900 mb-4">Review &amp; Submit</h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                {[
                  { label: 'Business', value: formData.businessName },
                  { label: 'Category', value: formData.category },
                  { label: 'Location', value: formData.location },
                  { label: 'Contact', value: formData.contactName },
                  { label: 'Email', value: formData.email },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-orange-500 flex-shrink-0"
                  required
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-orange-500 hover:underline font-medium" target="_blank">
                    Terms &amp; Conditions
                  </Link>
                  . My business will be reviewed before going live.
                </span>
              </label>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || !agreedToTerms}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
              <p className="text-gray-500 mb-4 leading-relaxed">
                Thank you for registering <strong>{formData.businessName}</strong>. We&apos;ll review your application and get back to you within 24 hours.
              </p>
              {needsConfirmation ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-6 text-left">
                  <p className="font-semibold mb-1">One more step: confirm your email</p>
                  <p>We sent a confirmation link to <strong>{formData.email}</strong>. Click it to activate your account, then log in to check your application status.</p>
                </div>
              ) : (
                <Link
                  href="/business/dashboard"
                  className="block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200 text-center mb-3"
                >
                  Go to Dashboard
                </Link>
              )}
              {emailWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-3 text-left">
                  <p className="font-semibold mb-1">Admin notification may have failed</p>
                  <p>Your application was saved, but the admin email may not have sent. Please contact <a href="mailto:storeroro07@gmail.com" className="underline">storeroro07@gmail.com</a> to let us know.</p>
                </div>
              )}
              <Link href="/" className="block text-gray-500 hover:text-gray-700 text-sm text-center">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
