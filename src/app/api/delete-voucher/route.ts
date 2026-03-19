import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
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

    const { voucherId, dealId } = await req.json()
    if (!voucherId) {
      return NextResponse.json({ error: 'No voucherId provided' }, { status: 400 })
    }

    // Ensure the voucher belongs to this user
    const { data: voucher } = await admin
      .from('vouchers')
      .select('id, user_id')
      .eq('id', voucherId)
      .single()

    if (!voucher || voucher.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await admin.from('vouchers').delete().eq('id', voucherId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Decrement vouchers_sold on the deal
    if (dealId) {
      const { data: deal } = await admin
        .from('deals')
        .select('vouchers_sold')
        .eq('id', dealId)
        .single()

      if (deal && deal.vouchers_sold > 0) {
        await admin
          .from('deals')
          .update({ vouchers_sold: deal.vouchers_sold - 1 })
          .eq('id', dealId)
      }
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('delete-voucher error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
