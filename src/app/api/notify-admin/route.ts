import { createHmac } from 'crypto'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

function generateToken(secret: string, businessId: string, action: string): string {
  return createHmac('sha256', secret)
    .update(businessId + action)
    .digest('hex')
}

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { businessId, businessName, category, location, contactName, contactEmail, phone } = await request.json()

  const secret = process.env.ADMIN_ACTION_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aruba-deals.vercel.app'

  let actionButtons = ''
  if (secret && businessId) {
    const approveToken = generateToken(secret, businessId, 'approve')
    const rejectToken = generateToken(secret, businessId, 'reject')
    const approveUrl = `${siteUrl}/api/admin-action?id=${businessId}&action=approve&token=${approveToken}`
    const rejectUrl = `${siteUrl}/api/admin-action?id=${businessId}&action=reject&token=${rejectToken}`
    const dashboardUrl = `${siteUrl}/manage-x9k4?focus=${businessId}`

    actionButtons = `
      <div style="margin-top: 28px; text-align: center;">
        <p style="color: #6b7280; font-size: 13px; margin-bottom: 16px;">Take action directly from this email:</p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <a href="${approveUrl}" style="display: inline-block; background: #16a34a; color: white; font-weight: 700; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 16px;">
            ✅ Approve
          </a>
          <a href="${rejectUrl}" style="display: inline-block; background: #dc2626; color: white; font-weight: 700; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 16px;">
            🚫 Reject
          </a>
        </div>
        <div style="margin-top: 16px;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #f97316; color: white; font-weight: 700; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-size: 14px;">
            Review in Admin Dashboard
          </a>
        </div>
      </div>
    `
  } else {
    actionButtons = `
      <div style="margin-top: 24px; text-align: center;">
        <a href="${siteUrl}/manage-x9k4" style="display: inline-block; background: #f97316; color: white; font-weight: 700; padding: 12px 32px; border-radius: 10px; text-decoration: none;">
          Review in Admin Dashboard
        </a>
      </div>
    `
  }

  try {
    await resend.emails.send({
      from: 'ArubaSave <onboarding@resend.dev>',
      to: 'storeroro07@gmail.com',
      subject: `New Business Application: ${businessName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Business Application</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">ArubaSave — Review Required</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Business Name</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${businessName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Category</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${category}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${location}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Contact Name</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${contactName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Contact Email</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${contactEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${phone || '—'}</td></tr>
            </table>
            ${actionButtons}
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
