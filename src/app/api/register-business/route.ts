import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()
  const { userId, email, contactName, businessName, category, location, description, phone } = body

  if (!userId || !email || !businessName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: contactName,
    role: 'business',
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Insert business as pending
  const { data: bizData, error: bizError } = await supabase.from('businesses').insert({
    name: businessName,
    category,
    location,
    description,
    contact_name: contactName,
    contact_email: email,
    phone,
    owner_id: userId,
    status: 'pending',
  }).select('id').single()

  if (bizError) {
    return NextResponse.json({ error: bizError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, businessId: bizData.id })
}
