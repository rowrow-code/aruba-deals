import { supabase } from './supabase'
import { Deal, Business, Voucher, Review } from './types'

export async function getDeals(category?: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, business:businesses(*)')
    .eq('is_active', true)
    .or('expiration_date.is.null,expiration_date.gt.' + new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  const deals = (data as Deal[]) || []

  if (category) {
    return deals.filter((d) => d.business?.category === category)
  }
  return deals
}

export async function getDeal(id: string): Promise<Deal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, business:businesses(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Deal
}

export async function incrementDealViews(dealId: string): Promise<void> {
  await supabase.rpc('increment_deal_views', { deal_id: dealId })
}

export async function getMyVouchers(userId: string): Promise<Voucher[]> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*, deal:deals(*, business:businesses(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Voucher[]) || []
}

export async function getMyBusiness(ownerId: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (error) return null
  return data as Business | null
}

export async function getBusinessDeals(businessId: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, business:businesses(*)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Deal[]) || []
}

export async function createDeal(dealData: {
  business_id: string
  title: string
  description: string
  original_price: number
  deal_price: number
  expiration_date: string
  included: string[]
  location: string
  images?: string[]
  total_available?: number
  voucher_expiry_hours?: number | null
  time_slot_enabled?: boolean
}): Promise<Deal> {
  // Base insert — only fields that always exist in the DB
  const { data, error } = await supabase
    .from('deals')
    .insert({
      business_id: dealData.business_id,
      title: dealData.title,
      description: dealData.description,
      original_price: dealData.original_price,
      deal_price: dealData.deal_price,
      expiration_date: dealData.expiration_date,
      included: dealData.included,
      location: dealData.location,
      images: dealData.images ?? [],
      total_available: dealData.total_available ?? 50,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  // Optional new columns — silently ignored if SQL migration not run yet
  if (dealData.voucher_expiry_hours != null || dealData.time_slot_enabled) {
    await supabase
      .from('deals')
      .update({
        voucher_expiry_hours: dealData.voucher_expiry_hours ?? null,
        time_slot_enabled: dealData.time_slot_enabled ?? false,
      })
      .eq('id', (data as Deal).id)
      .then(() => {}) // ignore errors — columns may not exist yet
  }

  return data as Deal
}

export async function getDealReviews(dealId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Review[]) || []
}

export async function submitReview(review: {
  deal_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .upsert(review, { onConflict: 'deal_id,user_id' })
    .select()
    .single()
  if (error) throw error
  return data as Review
}

export async function createVoucher(
  dealId: string,
  userId: string,
  bookingSlotId?: string | null
): Promise<Voucher> {
  // Enforce max 3 active vouchers per customer
  const { count } = await supabase
    .from('vouchers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')

  if ((count ?? 0) >= 3) {
    throw new Error('You already have 3 active vouchers. Cancel or use one before claiming another.')
  }

  // Check booking slot capacity if provided
  if (bookingSlotId) {
    const { data: slot } = await supabase
      .from('booking_slots')
      .select('id, max_capacity')
      .eq('id', bookingSlotId)
      .single()

    if (slot) {
      const { count: slotCount } = await supabase
        .from('vouchers')
        .select('id', { count: 'exact', head: true })
        .eq('booking_slot_id', bookingSlotId)
        .eq('status', 'active')

      if ((slotCount ?? 0) >= slot.max_capacity) {
        throw new Error('This time slot is fully booked. Please choose another slot.')
      }
    }
  }

  // Fetch deal for expiry calculation
  const { data: deal } = await supabase
    .from('deals')
    .select('voucher_expiry_hours')
    .eq('id', dealId)
    .single()

  const qrCode = `ARUBA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  let expiresAt: string | null = null
  if (deal?.voucher_expiry_hours) {
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + deal.voucher_expiry_hours)
    expiresAt = expiry.toISOString()
  }

  const { data, error } = await supabase
    .from('vouchers')
    .insert({
      deal_id: dealId,
      user_id: userId,
      qr_code: qrCode,
      status: 'active',
      expires_at: expiresAt,
      booking_slot_id: bookingSlotId ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Voucher
}
