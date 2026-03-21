'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const unconfirmed = searchParams.get('unconfirmed') === '1'

  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendError, setResendError] = useState<string | null>(null)

  const handleResend = async () => {
    if (!email) return
    setResendState('sending')
    setResendError(null)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      setResendError(error.message)
      setResendState('error')
    } else {
      setResendState('sent')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <Image src="/logo.png" alt="ArubaSave" width={56} height={56} className="rounded-2xl mx-auto mb-6" />

          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-orange-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {unconfirmed ? 'Verify your email to log in' : 'Check your email'}
          </h1>
          <p className="text-gray-500 mb-2">
            {unconfirmed ? 'You need to confirm your email before logging in. We sent a link to:' : 'We sent a confirmation link to:'}
          </p>
          <p className="font-semibold text-gray-800 text-lg mb-6 break-all">{email || 'your email'}</p>

          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-sm text-orange-700 font-semibold">Next steps:</p>
            <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Click the confirmation link in the email</li>
              <li>You will be logged in automatically</li>
            </ol>
          </div>

          {/* Resend section */}
          <div className="border-t border-gray-100 pt-5 mb-4">
            <p className="text-xs text-gray-400 mb-3">
              Did not receive the email? Check your spam folder or resend below.
            </p>

            {resendState === 'sent' ? (
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Email resent! Check your inbox.
              </div>
            ) : (
              <>
                <button
                  onClick={handleResend}
                  disabled={resendState === 'sending' || !email}
                  className="flex items-center justify-center gap-2 mx-auto text-sm font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${resendState === 'sending' ? 'animate-spin' : ''}`} />
                  {resendState === 'sending' ? 'Sending...' : 'Resend verification email'}
                </button>
                {resendState === 'error' && resendError && (
                  <p className="text-xs text-red-500 mt-2">{resendError}</p>
                )}
              </>
            )}
          </div>

          <Link
            href="/auth/login"
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  )
}
