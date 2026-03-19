import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return NextResponse.json({ ok: false })

    const { dealId } = await req.json()
    if (!dealId) return NextResponse.json({ ok: false })

    const admin = createClient(url, key)

    const { data: deal } = await admin
      .from('deals')
      .select('views')
      .eq('id', dealId)
      .single()

    await admin
      .from('deals')
      .update({ views: (deal?.views ?? 0) + 1 })
      .eq('id', dealId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
