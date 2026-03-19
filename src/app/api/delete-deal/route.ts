import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify the token and get the user
  const { data: { user }, error: authError } = await admin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { dealId } = await req.json()
  if (!dealId) {
    return NextResponse.json({ error: 'No dealId provided' }, { status: 400 })
  }

  // Verify the deal belongs to a business owned by this user
  const { data: deal } = await admin
    .from('deals')
    .select('id, business:businesses(owner_id)')
    .eq('id', dealId)
    .single()

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  const business = Array.isArray(deal.business) ? deal.business[0] : deal.business
  if (business?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Cascade delete related records first
  await admin.from('booking_slots').delete().eq('deal_id', dealId)
  await admin.from('vouchers').delete().eq('deal_id', dealId)
  await admin.from('reviews').delete().eq('deal_id', dealId)

  const { error } = await admin.from('deals').delete().eq('id', dealId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
