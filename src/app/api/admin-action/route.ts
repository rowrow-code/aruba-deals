import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function verifyToken(secret: string, businessId: string, action: string, token: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(businessId + action)
    .digest('hex')
  return expected === token
}

function htmlPage(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ArubaSave Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
    p { color: #6b7280; font-size: 15px; line-height: 1.6; }
    a { color: #f97316; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    .icon { font-size: 48px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')
  const token = searchParams.get('token')

  const secret = process.env.ADMIN_ACTION_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aruba-deals.vercel.app'

  if (!id || !action || !token || !secret) {
    return new Response(
      htmlPage('Invalid Request', '<div class="icon">⚠️</div><h1>Invalid Request</h1><p>This link is missing required parameters.</p>'),
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (action !== 'approve' && action !== 'reject') {
    return new Response(
      htmlPage('Invalid Action', '<div class="icon">⚠️</div><h1>Invalid Action</h1><p>Action must be approve or reject.</p>'),
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (!verifyToken(secret, id, action, token)) {
    return new Response(
      htmlPage('Unauthorized', '<div class="icon">🔒</div><h1>Unauthorized</h1><p>This link is invalid or has been tampered with.</p>'),
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const status = action === 'approve' ? 'approved' : 'rejected'

  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('name, contact_email')
    .eq('id', id)
    .single()

  if (fetchError || !business) {
    return new Response(
      htmlPage('Not Found', `<div class="icon">🔍</div><h1>Business Not Found</h1><p>Could not find this business. <a href="${siteUrl}/manage-x9k4">Open Admin Dashboard</a></p>`),
      { status: 404, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ status })
    .eq('id', id)

  if (updateError) {
    return new Response(
      htmlPage('Update Failed', `<div class="icon">❌</div><h1>Update Failed</h1><p>Database error: ${updateError.message}</p><p style="margin-top:12px"><a href="${siteUrl}/manage-x9k4?focus=${id}">Review in Admin Dashboard</a></p>`),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Notify business owner (fire and forget — don't block the response)
  fetch(`${siteUrl}/api/notify-business`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: business.name,
      contactEmail: business.contact_email,
      status,
    }),
  }).catch(() => {})

  const isApproved = status === 'approved'
  const icon = isApproved ? '✅' : '🚫'
  const color = isApproved ? '#16a34a' : '#dc2626'
  const body = `
    <div class="icon">${icon}</div>
    <h1 style="color:${color}">${isApproved ? 'Approved!' : 'Rejected'}</h1>
    <p style="margin-top:8px"><strong>${business.name}</strong> has been ${status}.</p>
    <p style="margin-top:12px">A notification email has been sent to the business owner.</p>
    <p style="margin-top:20px"><a href="${siteUrl}/manage-x9k4">Back to Admin Dashboard</a></p>
  `

  return new Response(htmlPage(isApproved ? 'Approved!' : 'Rejected', body), {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })
}
