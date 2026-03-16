import Link from 'next/link'
import { MapPin, Instagram, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AS</span>
              </div>
              <span className="font-bold text-xl text-white">
                aruba<span className="text-orange-500">save</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Discover the best deals on restaurants, activities, spa treatments, and more in beautiful Aruba.
            </p>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Aruba, ABC Islands</span>
            </div>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-orange-500 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-orange-500 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-orange-500 transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/deals" className="hover:text-orange-500 transition-colors">All Deals</Link></li>
              <li><Link href="/deals?category=Restaurants" className="hover:text-orange-500 transition-colors">Restaurants</Link></li>
              <li><Link href="/deals?category=Activities" className="hover:text-orange-500 transition-colors">Activities</Link></li>
              <li><Link href="/deals?category=Spa & Wellness" className="hover:text-orange-500 transition-colors">Spa &amp; Wellness</Link></li>
              <li><Link href="/deals?category=Fitness" className="hover:text-orange-500 transition-colors">Fitness</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link href="/business/dashboard" className="hover:text-orange-500 transition-colors">For Businesses</Link></li>
              <li><Link href="/auth/signup" className="hover:text-orange-500 transition-colors">Sign Up</Link></li>
              <li><Link href="/auth/login" className="hover:text-orange-500 transition-colors">Log In</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2025 ArubaSave. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
