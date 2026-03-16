import Link from 'next/link'
import { Search, ArrowRight, Star, TrendingUp, Shield, Smartphone } from 'lucide-react'
import DealCard from '@/components/DealCard'
import { mockDeals } from '@/lib/mock-data'

const categories = [
  { name: 'Restaurants', emoji: '🍽️', color: 'bg-orange-50 hover:bg-orange-100 border-orange-100', count: '24 deals' },
  { name: 'Activities', emoji: '🤿', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100', count: '18 deals' },
  { name: 'Spa & Wellness', emoji: '💆', color: 'bg-pink-50 hover:bg-pink-100 border-pink-100', count: '12 deals' },
  { name: 'Nightlife', emoji: '🎵', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100', count: '8 deals' },
  { name: 'Fitness', emoji: '💪', color: 'bg-green-50 hover:bg-green-100 border-green-100', count: '10 deals' },
]

export default function HomePage() {
  const featuredDeals = mockDeals.slice(0, 3)
  const allDeals = mockDeals.slice(3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-pink-500 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400"
            alt="Aruba beach"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 mr-2 fill-yellow-300 text-yellow-300" />
              Aruba&apos;s #1 Deals Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover the Best
              <br />
              <span className="text-yellow-300">Deals in Aruba</span>
            </h1>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Save big on restaurants, water sports, spa treatments, and local experiences. The best of Aruba at unbeatable prices.
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl p-2">
                <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search deals, restaurants, activities..."
                  className="flex-1 px-4 py-3 text-gray-700 bg-transparent outline-none placeholder-gray-400"
                />
                <Link href="/deals" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                  Find Deals
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {[
                { value: '72+', label: 'Active Deals' },
                { value: '40+', label: 'Local Businesses' },
                { value: '2,500+', label: 'Happy Customers' },
                { value: '45%', label: 'Average Savings' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-orange-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1440 30 1080 0 720 0C360 0 0 30 0 30L0 60Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-1">Find exactly what you&apos;re looking for</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/deals?category=${encodeURIComponent(cat.name)}`}
              className={`${cat.color} border rounded-2xl p-5 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="font-semibold text-gray-900 text-sm">{cat.name}</div>
              <div className="text-gray-500 text-xs mt-1">{cat.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">Hot Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Deals</h2>
          </div>
          <Link href="/deals" className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-semibold transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* More Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">More Deals</h2>
          <Link href="/deals" className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-semibold transition-colors">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How ArubaSave Works</h2>
            <p className="text-gray-500 mt-2">Get your deal in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Search, title: 'Find a Deal', desc: 'Browse hundreds of deals from local businesses in Aruba.' },
              { step: '2', icon: Smartphone, title: 'Claim Your Voucher', desc: 'Create a free account and claim your digital voucher instantly.' },
              { step: '3', icon: Shield, title: 'Enjoy & Save', desc: 'Show your QR code at the business and enjoy your experience!' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-orange-100 -mt-2 mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-orange-500 to-pink-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Are You a Local Business?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Join ArubaSave and reach thousands of locals and tourists. List your deals for free and grow your customer base.
          </p>
          <Link
            href="/business/register"
            className="inline-block bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-4 rounded-2xl transition-colors shadow-lg text-lg"
          >
            List Your Business Free
          </Link>
        </div>
      </section>
    </div>
  )
}
