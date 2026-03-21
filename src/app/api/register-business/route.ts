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

  let userId: string

  // Try to create the user via admin API
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: contactName, role: 'business' },
  })

  if (createError) {
    // If email already exists, look them up directly from profiles table
    if (createError.message.toLowerCase().includes('already') || createError.status === 422) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (!existingProfile) {
        // Profile doesn't exist yet — look up via admin listUsers with pagination
        let foundId: string | null = null
        let page = 1
        while (!foundId) {
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ page, perPage: 50 })
          if (listError || users.length === 0) break
          const match = users.find((u) => u.email === email)
          if (match) { foundId = match.id; break }
          if (users.length < 50) break
          page++
        }
        if (!foundId) {
          return NextResponse.json({ error: 'Account exists but could not be located. Please contact support.' }, { status: 500 })
        }
        userId = foundId
      } else {
        userId = existingProfile.id
      }

      // Check if this user already has a business
      const { data: existingBiz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle()

      if (existingBiz) {
        return NextResponse.json(
          { error: 'You already have a business registered. Log in to your dashboard to manage it.' },
          { status: 400 }
        )
      }

      // Update their role to business
      await supabase.from('profiles').update({ role: 'business', full_name: contactName }).eq('id', userId)
    } else {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
  } else {
    userId = newUser.user.id

    // Create profile for the new user
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: contactName,
      role: 'business',
    })

    if (profileError) {
      // Clean up the auth user we just created to avoid orphaned accounts
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
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
