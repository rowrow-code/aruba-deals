import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key)
}

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const admin = adminClient()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return admin
}

// GET /api/admin-users — returns customers with active voucher counts
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profiles }, { data: vouchers }] = await Promise.all([
      admin.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
      admin.from('vouchers').select('user_id').eq('status', 'active'),
    ])

    const counts: Record<string, number> = {}
    for (const v of vouchers ?? []) {
      counts[v.user_id] = (counts[v.user_id] || 0) + 1
    }

    return NextResponse.json({ users: profiles ?? [], voucherCounts: counts })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin-users — removes a user completely
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    // Delete dependent data
    await admin.from('vouchers').delete().eq('user_id', userId)
    await admin.from('reviews').delete().eq('user_id', userId)
    await admin.from('profiles').delete().eq('id', userId)

    // Delete from Supabase Auth
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
