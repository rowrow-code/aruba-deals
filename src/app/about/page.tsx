import Link from 'next/link'
import { MapPin, Heart, Tag, Store } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">About ArubaSave</h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Helping visitors and locals discover the best deals Aruba has to offer — one voucher at a time.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-16">

        {/* Our Story */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Our Story</h2>
          <div className="prose text-gray-600 leading-relaxed space-y-4">
            <p>
              ArubaSave was born out of a simple idea: Aruba is one of the most beautiful islands in the Caribbean, but experiencing everything it has to offer shouldn&apos;t have to break the bank.
            </p>
            <p>
              Whether you&apos;re a tourist visiting for the first time or a local looking for something new to try, there are incredible restaurants, activities, spa treatments, and experiences all around the island — many of which go undiscovered simply because people don&apos;t know about them or can&apos;t justify the price.
            </p>
            <p>
              We built ArubaSave to change that. By partnering directly with local businesses, we bring exclusive deals to the people who want them most, while helping Aruba&apos;s small business community grow and get more customers through the door.
            </p>
          </div>
        </section>

        {/* What we do */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-8">What We Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Tag,
                color: 'bg-orange-50 text-orange-500',
                title: 'Exclusive Deals',
                desc: 'We work with local businesses to offer discounts you won\'t find anywhere else — up to 50% off on real experiences.',
              },
              {
                icon: Store,
                color: 'bg-pink-50 text-pink-500',
                title: 'Supporting Local',
                desc: 'Every deal you claim puts money directly into a local Aruban business. No big chains, no middlemen.',
              },
              {
                icon: Heart,
                color: 'bg-green-50 text-green-500',
                title: 'Free to Use',
                desc: 'ArubaSave is completely free for customers. Sign up, browse deals, and claim your voucher in seconds.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Our mission is to make Aruba more accessible — for tourists who want to get the most out of their trip, and for locals who want to enjoy everything the island has to offer without overspending. At the same time, we want to give Aruban businesses a simple, modern way to attract new customers and fill their seats.
          </p>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Based in Aruba</h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Aruba, ABC Islands</p>
              <p className="text-gray-500 leading-relaxed">
                ArubaSave is proudly local. We&apos;re based right here on the island, which means we know the businesses, the people, and the culture. Every partnership we make is personal, and every deal we list is one we stand behind.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Ready to start saving?</h2>
          <p className="text-gray-500 mb-8">Browse deals from the best local businesses in Aruba — for free.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/deals"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-orange-200"
            >
              Browse Deals
            </Link>
            <Link
              href="/business/register"
              className="border-2 border-gray-200 hover:border-orange-400 text-gray-700 hover:text-orange-500 font-bold px-8 py-4 rounded-xl transition-colors"
            >
              List Your Business
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
