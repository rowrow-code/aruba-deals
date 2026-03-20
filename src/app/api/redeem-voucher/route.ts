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

    // Verify user is a business owner
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'business') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { qrCode } = await req.json()
    if (!qrCode) {
      return NextResponse.json({ error: 'No qrCode provided' }, { status: 400 })
    }

    const trimmed = (qrCode as string).toUpperCase().trim()

    // Look up voucher with deal and business info (bypasses RLS via service role)
    const { data: voucher, error: voucherError } = await admin
      .from('vouchers')
      .select('*, deal:deals(*, business:businesses(*))')
      .eq('qr_code', trimmed)
      .maybeSingle()

    if (voucherError || !voucher) {
      return NextResponse.json({ error: 'Voucher not found. Check the code and try again.' }, { status: 404 })
    }

    const deal = voucher.deal as { title: string; business: { owner_id: string } }

    // Verify this voucher belongs to the business of the authenticated user
    if (deal.business.owner_id !== user.id) {
      return NextResponse.json({ error: 'This voucher is for a different business.' }, { status: 403 })
    }

    // Check status before atomic update for a clear error message
    if (voucher.status !== 'active') {
      return NextResponse.json({ error: 'This voucher has already been used.' }, { status: 409 })
    }

    // Atomic update: only succeeds if voucher is still active
    const { data: updated, error: updateError } = await admin
      .from('vouchers')
      .update({ status: 'used' })
      .eq('id', voucher.id)
      .eq('status', 'active')
      .select('id')

    if (updateError) {
      return NextResponse.json({ error: 'Failed to redeem voucher. Please try again.' }, { status: 500 })
    }

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'This voucher has already been used.' }, { status: 409 })
    }

    return NextResponse.json({ success: true, dealTitle: deal.title })

  } catch (err: any) {
    console.error('redeem-voucher error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
