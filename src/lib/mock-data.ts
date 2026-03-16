import { Deal, Business } from './types'

export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Zeerovers Restaurant',
    category: 'Restaurants',
    location: 'Savaneta, Aruba',
    description: 'Authentic local seafood experience',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    owner_id: 'owner1',
    status: 'approved' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Aruba Watersports',
    category: 'Activities',
    location: 'Palm Beach, Aruba',
    description: 'Premier watersports center',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    owner_id: 'owner2',
    status: 'approved' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Manchebo Beach Spa',
    category: 'Spa & Wellness',
    location: 'Manchebo Beach, Aruba',
    description: 'Luxury beachside spa treatments',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    owner_id: 'owner3',
    status: 'approved' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Sunset Sailing Aruba',
    category: 'Activities',
    location: 'Oranjestad Harbor, Aruba',
    description: 'Unforgettable sunset sailing tours',
    image_url: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800',
    owner_id: 'owner4',
    status: 'approved' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Wilhelmina Restaurant',
    category: 'Restaurants',
    location: 'Oranjestad, Aruba',
    description: 'Classic Aruban cuisine in the heart of Oranjestad',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    owner_id: 'owner5',
    status: 'approved' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Aruba Yoga & Wellness',
    category: 'Fitness',
    location: 'Eagle Beach, Aruba',
    description: 'Beach yoga and wellness retreats',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    owner_id: 'owner6',
    status: 'approved' as const,
    created_at: new Date().toISOString()
  },
]

export const mockDeals: Deal[] = [
  {
    id: '1',
    business_id: '1',
    title: 'Fresh Fish Platter for 2',
    description: 'Experience the freshest local catch at Zeerovers, a beloved institution in Aruba. Enjoy a generous platter of freshly fried fish, shrimp, and conch with local sides.',
    original_price: 65,
    deal_price: 39,
    expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'
    ],
    included: ['Fish platter for 2', 'Local side dishes', '2 soft drinks', 'Dessert'],
    location: 'Savaneta 239Z, Aruba',
    rating: 4.8,
    total_available: 50,
    vouchers_sold: 23,
    is_active: true,
    created_at: new Date().toISOString(),
    business: mockBusinesses[0]
  },
  {
    id: '2',
    business_id: '2',
    title: 'Snorkeling Adventure Tour',
    description: 'Explore Aruba\'s stunning underwater world with a 2-hour guided snorkeling tour. Visit the famous Antilla shipwreck and colorful coral reefs.',
    original_price: 85,
    deal_price: 55,
    expiration_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800'
    ],
    included: ['2-hour guided tour', 'Snorkeling equipment', 'Underwater guide', 'Refreshments'],
    location: 'Palm Beach, Aruba',
    rating: 4.9,
    total_available: 20,
    vouchers_sold: 18,
    is_active: true,
    created_at: new Date().toISOString(),
    business: mockBusinesses[1]
  },
  {
    id: '3',
    business_id: '3',
    title: 'Luxury Couples Massage',
    description: 'Indulge in a 90-minute couples massage with ocean views at the prestigious Manchebo Beach Spa. Includes aromatherapy and complimentary champagne.',
    original_price: 180,
    deal_price: 110,
    expiration_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
    ],
    included: ['90-min couples massage', 'Aromatherapy oils', 'Champagne for 2', 'Access to spa facilities'],
    location: 'Manchebo Beach Road 55, Aruba',
    rating: 4.7,
    total_available: 10,
    vouchers_sold: 6,
    is_active: true,
    created_at: new Date().toISOString(),
    business: mockBusinesses[2]
  },
  {
    id: '4',
    business_id: '4',
    title: 'Romantic Sunset Sailing',
    description: 'Set sail on a breathtaking 3-hour sunset cruise along Aruba\'s stunning coastline. Includes unlimited drinks and fresh snacks.',
    original_price: 120,
    deal_price: 75,
    expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800',
      'https://images.unsplash.com/photo-1504076252791-c1de8bb7de31?w=800'
    ],
    included: ['3-hour sailing tour', 'Unlimited drinks', 'Snacks & snorkeling stop', 'Professional photos'],
    location: 'Oranjestad Harbor, Aruba',
    rating: 5.0,
    total_available: 30,
    vouchers_sold: 28,
    is_active: true,
    created_at: new Date().toISOString(),
    business: mockBusinesses[3]
  },
  {
    id: '5',
    business_id: '5',
    title: '3-Course Aruban Dinner',
    description: 'Savor authentic Aruban cuisine with a traditional 3-course dinner at the historic Wilhelmina Restaurant in the heart of Oranjestad.',
    original_price: 90,
    deal_price: 59,
    expiration_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
    ],
    included: ['Starter', 'Main course', 'Dessert', 'Glass of wine or local beer'],
    location: 'Wilhelminastraat 2, Oranjestad',
    rating: 4.6,
    total_available: 40,
    vouchers_sold: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    business: mockBusinesses[4]
  },
  {
    id: '6',
    business_id: '6',
    title: 'Sunrise Beach Yoga Class',
    description: 'Start your day with an energizing sunrise yoga session on the pristine Eagle Beach. Suitable for all levels.',
    original_price: 45,
    deal_price: 25,
    expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
    ],
    included: ['60-min yoga class', 'Yoga mat rental', 'Refreshing smoothie', 'Meditation session'],
    location: 'Eagle Beach, Aruba',
    rating: 4.8,
    total_available: 15,
    vouchers_sold: 8,
    is_active: true,
    created_at: new Date().toISOString(),
    business: mockBusinesses[5]
  },
]
