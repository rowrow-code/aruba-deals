import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createClient(url, key)

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { dealId, rating, comment } = await req.json()
    if (!dealId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Verify user has a used voucher for this deal
    const { data: voucher } = await admin
      .from('vouchers')
      .select('id')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .eq('status', 'used')
      .maybeSingle()

    if (!voucher) {
      return NextResponse.json({ error: 'You can only review deals you have redeemed.' }, { status: 403 })
    }

    // Get user's name
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data, error } = await admin
      .from('reviews')
      .upsert({
        deal_id: dealId,
        user_id: user.id,
        user_name: profile?.full_name || 'Anonymous',
        rating,
        comment: comment || null,
      }, { onConflict: 'deal_id,user_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ review: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
