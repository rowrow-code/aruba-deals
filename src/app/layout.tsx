import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import AuthErrorRedirect from '@/components/AuthErrorRedirect'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArubaSave - Best Deals in Aruba',
  description: 'Discover the best deals on restaurants, activities, spa treatments, and more in beautiful Aruba.',
  keywords: 'aruba deals, aruba discounts, aruba restaurants, aruba activities, aruba vouchers',
  verification: {
    google: 'G94HIxnhZRe7iwBsOPzSpjPn4fCEnjPlUd3PUs',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthErrorRedirect />
        <Navbar />
        <main className="pb-16 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  )
}
