import { supabase } from './supabase'
import { Deal, Business, Voucher } from './types'

export async function getDeals(category?: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, business:businesses(*)')
    .eq('is_active', true)
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
}): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      ...dealData,
      images: dealData.images ?? [],
      total_available: dealData.total_available ?? 50,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as Deal
}

export async function createVoucher(dealId: string, userId: string): Promise<Voucher> {
  const qrCode = `ARUBA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  const { data, error } = await supabase
    .from('vouchers')
    .insert({
      deal_id: dealId,
      user_id: userId,
      qr_code: qrCode,
      status: 'active',
    })
    .select()
    .single()

  if (error) throw error
  return data as Voucher
}
