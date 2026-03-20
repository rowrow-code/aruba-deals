'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <Image src="/logo.png" alt="ArubaSave" width={56} height={56} className="rounded-2xl mx-auto mb-6" />

          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-orange-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 mb-2">We sent a confirmation link to:</p>
          <p className="font-semibold text-gray-800 text-lg mb-6 break-all">{email}</p>

          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-sm text-orange-700 font-semibold">Next steps:</p>
            <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Click the confirmation link in the email</li>
              <li>You will be logged in automatically</li>
            </ol>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Did not receive the email? Check your spam folder. The link expires after 24 hours.
          </p>

          <Link
            href="/auth/login"
            className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
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
