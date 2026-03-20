import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key)
}

export async function PATCH(req: NextRequest) {
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

    const body = await req.json()
    const { dealId, title, description, original_price, deal_price, total_available, expiration_date, image_url, included } = body

    if (!dealId) {
      return NextResponse.json({ error: 'No dealId provided' }, { status: 400 })
    }

    // Verify ownership
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

    const updates: Record<string, any> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (original_price !== undefined) updates.original_price = Number(original_price)
    if (deal_price !== undefined) updates.deal_price = Number(deal_price)
    if (total_available !== undefined) updates.total_available = Number(total_available)
    if (expiration_date !== undefined) updates.expiration_date = new Date(expiration_date).toISOString()
    if (image_url !== undefined) updates.images = image_url ? [image_url] : []
    if (included !== undefined) updates.included = included.split('\n').map((s: string) => s.trim()).filter(Boolean)

    const { data: updated, error: updateError } = await admin
      .from('deals')
      .update(updates)
      .eq('id', dealId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ deal: updated })

  } catch (err: any) {
    console.error('update-deal error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
