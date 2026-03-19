import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
    }

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createClient(url, key)

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dealId, bookingSlotId } = await req.json()
    if (!dealId) {
      return NextResponse.json({ error: 'No dealId provided' }, { status: 400 })
    }

    // Check max 3 active vouchers
    const { count } = await admin
      .from('vouchers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'You already have 3 active vouchers. Use or cancel one before claiming another.' },
        { status: 400 }
      )
    }

    // Check deal exists and has spots
    const { data: deal } = await admin
      .from('deals')
      .select('id, vouchers_sold, total_available, expiration_date, voucher_expiry_hours')
      .eq('id', dealId)
      .single()

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.vouchers_sold >= deal.total_available) {
      return NextResponse.json({ error: 'This deal is sold out.' }, { status: 400 })
    }

    // Check if user already has a voucher for this deal
    const { data: existing } = await admin
      .from('vouchers')
      .select('id')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'You already have a voucher for this deal.' }, { status: 400 })
    }

    // Check booking slot capacity if provided
    if (bookingSlotId) {
      const { data: slot } = await admin
        .from('booking_slots')
        .select('id, max_capacity')
        .eq('id', bookingSlotId)
        .single()

      if (slot) {
        const { count: slotCount } = await admin
          .from('vouchers')
          .select('id', { count: 'exact', head: true })
          .eq('booking_slot_id', bookingSlotId)
          .eq('status', 'active')

        if ((slotCount ?? 0) >= slot.max_capacity) {
          return NextResponse.json({ error: 'This time slot is fully booked. Please choose another.' }, { status: 400 })
        }
      }
    }

    // Calculate expiry
    let expiresAt: string | null = null
    if (deal.voucher_expiry_hours) {
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + deal.voucher_expiry_hours)
      expiresAt = expiry.toISOString()
    }

    const qrCode = `ARUBA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Insert voucher
    const { data: voucher, error: insertError } = await admin
      .from('vouchers')
      .insert({
        deal_id: dealId,
        user_id: user.id,
        qr_code: qrCode,
        status: 'active',
        expires_at: expiresAt,
        booking_slot_id: bookingSlotId ?? null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Increment vouchers_sold
    await admin
      .from('deals')
      .update({ vouchers_sold: deal.vouchers_sold + 1 })
      .eq('id', dealId)

    return NextResponse.json({ voucher })

  } catch (err: any) {
    console.error('create-voucher error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
