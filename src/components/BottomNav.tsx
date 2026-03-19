'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Tag, QrCode, User } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/deals', label: 'Deals', icon: Tag },
  { href: '/dashboard', label: 'Vouchers', icon: QrCode },
  { href: '/auth/login', label: 'Account', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg safe-area-pb">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-semibold ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-orange-500 rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
