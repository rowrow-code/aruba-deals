'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setAuthError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: name,
        role: 'customer',
      })
    }

    if (data.session) {
      window.location.href = '/dashboard'
    } else {
      setConfirmed(true)
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendStatus(null)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResendStatus(error ? 'Failed to resend. Try again.' : 'Sent! Check your inbox.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {confirmed ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-1">We sent a confirmation link to</p>
              <p className="text-gray-800 font-semibold mb-6">{email}</p>
              {resendStatus && (
                <p className={`text-sm mb-4 ${resendStatus.startsWith('Sent') ? 'text-green-600' : 'text-red-600'}`}>
                  {resendStatus}
                </p>
              )}
              <button
                onClick={handleResend}
                className="w-full border border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-3 rounded-xl transition-colors mb-3"
              >
                Resend email
              </button>
              <Link href="/auth/login" className="block text-center text-gray-500 text-sm hover:text-gray-700">
                Back to login
              </Link>
            </div>
          ) : (
          <>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">AS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1">Start saving on the best Aruba deals</p>
          </div>

          {/* Benefits */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <ul className="space-y-2">
              {['Free to sign up', 'Instant digital vouchers', 'Access to exclusive deals'].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-orange-700">
                  <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-semibold">
              Log in
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
