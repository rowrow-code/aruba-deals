import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()
  const { email, password, contactName, businessName, category, location, description, phone } = body

  if (!email || !password || !businessName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if user already exists
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existingUser = users.find((u) => u.email === email)

  let userId: string

  if (existingUser) {
    // User already has an account — check if they already have a business
    const { data: existingBiz } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', existingUser.id)
      .maybeSingle()

    if (existingBiz) {
      return NextResponse.json(
        { error: 'You already have a business registered. Log in to your dashboard to manage it.' },
        { status: 400 }
      )
    }

    userId = existingUser.id
    // Update their role to business
    await supabase.from('profiles').update({ role: 'business' }).eq('id', userId)
  } else {
    // Create new user via admin API — sends confirmation email automatically
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // requires email confirmation
      user_metadata: { full_name: contactName, role: 'business' },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    userId = newUser.user.id

    // Create profile
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: contactName,
      role: 'business',
    })
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

  return NextResponse.json({ success: true, businessId: bizData.id, userId })
}
