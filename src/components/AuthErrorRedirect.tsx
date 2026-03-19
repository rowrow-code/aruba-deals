'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Handles Supabase auth error hash params that land on the root URL.
// e.g. /#error=access_denied&error_code=otp_expired
export default function AuthErrorRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash) return

    const params = new URLSearchParams(hash.slice(1))
    const errorCode = params.get('error_code')
    const type = params.get('type')

    // Expired / invalid password reset link → send to forgot-password with message
    if (errorCode === 'otp_expired' || params.get('error') === 'access_denied') {
      router.replace('/auth/forgot-password?expired=1')
      return
    }

    // Valid recovery token that landed on root (shouldn't normally happen, but just in case)
    if (type === 'recovery' && params.get('access_token')) {
      router.replace('/auth/reset-password' + hash)
    }
  }, [router])

  return null
}
