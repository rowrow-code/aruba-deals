import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key)
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = adminClient()

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { dealId, businessId } = body

    if (businessId) {
      const { data: deals } = await admin
        .from('deals')
        .select('id')
        .eq('business_id', businessId)

      for (const deal of deals ?? []) {
        await admin.from('vouchers').delete().eq('deal_id', deal.id)
        await admin.from('booking_slots').delete().eq('deal_id', deal.id)
        await admin.from('reviews').delete().eq('deal_id', deal.id)
      }

      await admin.from('deals').delete().eq('business_id', businessId)
      const { error } = await admin.from('businesses').delete().eq('id', businessId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    } else if (dealId) {
      await admin.from('vouchers').delete().eq('deal_id', dealId)
      await admin.from('booking_slots').delete().eq('deal_id', dealId)
      await admin.from('reviews').delete().eq('deal_id', dealId)

      const { error } = await admin.from('deals').delete().eq('id', dealId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    } else {
      return NextResponse.json({ error: 'No dealId or businessId provided' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('admin-delete-deal error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
