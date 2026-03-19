'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const loadUser = async (u: User | null) => {
      setUser(u)
      if (!u) { setIsAdmin(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', u.id)
        .single()
      if (data?.role === 'admin') setIsAdmin(true)
    }

    supabase.auth.getUser().then(({ data: { user } }) => loadUser(user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="ArubaSave" width={36} height={36} className="rounded-lg" />
            <span className="font-bold text-xl text-gray-900">
              Aruba<span className="text-orange-500">Save</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1 text-orange-500" />
              <span>Aruba</span>
            </div>
            <Link href="/deals" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              All Deals
            </Link>
            <Link href="/deals?category=Restaurants" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Restaurants
            </Link>
            <Link href="/deals?category=Activities" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Activities
            </Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAdmin && (
              <Link href="/manage-x9k4" className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  My Vouchers
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Log in
                </Link>
                <Link href="/auth/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign up
                </Link>
              </>
            )}
            <Link href="/business/dashboard" className="border border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-500 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
              For Business
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/deals" className="block text-gray-700 font-medium py-2">All Deals</Link>
          <Link href="/deals?category=Restaurants" className="block text-gray-700 font-medium py-2">Restaurants</Link>
          <Link href="/deals?category=Activities" className="block text-gray-700 font-medium py-2">Activities</Link>
          <Link href="/deals?category=Spa & Wellness" className="block text-gray-700 font-medium py-2">Spa &amp; Wellness</Link>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            {isAdmin && (
              <Link href="/manage-x9k4" className="block bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium text-center text-sm">Admin</Link>
            )}
            {user ? (
              <>
                <Link href="/dashboard" className="block text-gray-700 font-medium py-2">My Vouchers</Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-gray-700 font-medium py-2">Log in</Link>
                <Link href="/auth/signup" className="block bg-orange-500 text-white px-4 py-2 rounded-lg font-medium text-center">Sign up</Link>
              </>
            )}
            <Link href="/business/dashboard" className="block border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-center text-sm">For Business</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
