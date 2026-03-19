import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  // Validate session
  const supabaseAuth = await createSupabaseServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { dealId, businessId } = await req.json()

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (businessId) {
    // Delete entire business: remove all deals and their related records first
    const { data: deals } = await admin
      .from('deals')
      .select('id')
      .eq('business_id', businessId)

    for (const deal of deals ?? []) {
      await admin.from('booking_slots').delete().eq('deal_id', deal.id)
      await admin.from('vouchers').delete().eq('deal_id', deal.id)
      await admin.from('reviews').delete().eq('deal_id', deal.id)
    }

    await admin.from('deals').delete().eq('business_id', businessId)
    const { error } = await admin.from('businesses').delete().eq('id', businessId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  } else if (dealId) {
    // Delete single deal and its related records
    await admin.from('booking_slots').delete().eq('deal_id', dealId)
    await admin.from('vouchers').delete().eq('deal_id', dealId)
    await admin.from('reviews').delete().eq('deal_id', dealId)

    const { error } = await admin.from('deals').delete().eq('id', dealId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  } else {
    return NextResponse.json({ error: 'No dealId or businessId provided' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
