export interface Business {
  id: string
  name: string
  category: string
  location: string
  description: string
  image_url?: string
  owner_id: string
  status: 'pending' | 'approved' | 'rejected'
  contact_name?: string
  contact_email?: string
  phone?: string
  created_at: string
}

export interface BookingSlot {
  id: string
  deal_id: string
  slot_label: string
  max_capacity: number
  is_active: boolean
  created_at: string
}

export interface Deal {
  id: string
  business_id: string
  title: string
  description: string
  original_price: number
  deal_price: number
  expiration_date: string
  images: string[]
  included: string[]
  location: string
  rating: number
  total_available: number
  vouchers_sold: number
  is_active: boolean
  created_at: string
  views?: number
  voucher_expiry_hours?: number | null
  time_slot_enabled?: boolean
  business?: Business
}

export interface Voucher {
  id: string
  user_id: string
  deal_id: string
  qr_code: string
  status: 'active' | 'used' | 'expired'
  created_at: string
  expires_at?: string | null
  booking_slot_id?: string | null
  booking_slot?: BookingSlot
  deal?: Deal
}

export interface Review {
  id: string
  deal_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'customer' | 'business' | 'admin'
  created_at: string
}

export interface SupportMessage {
  id: string
  business_id: string
  message: string
  is_read: boolean
  created_at: string
  business?: Business
}
