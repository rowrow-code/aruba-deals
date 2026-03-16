'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.contactName, role: 'business' },
        },
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Failed to create account')

      // Insert the business as pending
      const { error: bizError } = await supabase.from('businesses').insert({
        name: formData.businessName,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        contact_name: formData.contactName,
        contact_email: formData.email,
        phone: formData.phone,
        owner_id: userId,
        status: 'pending',
      })

      if (bizError) throw bizError

      // Send email notification to admin
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          category: formData.category,
          location: formData.location,
          contactName: formData.contactName,
          contactEmail: formData.email,
          phone: formData.phone,
        }),
      })

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
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Store className="w-7 h-7 text-white" />
            </div>
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
              <div className="bg-orange-50 rounded-xl p-4 text-sm text-orange-700">
                By registering, you agree to our terms of service. Your business will be reviewed before going live.
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
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
              <p className="text-gray-500 mb-6 leading-relaxed">
                Thank you for registering <strong>{formData.businessName}</strong>. We&apos;ll review your application and get back to you within 24 hours.
              </p>
              <Link href="/" className="block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200 text-center">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
