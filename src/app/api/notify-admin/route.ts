import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { businessName, category, location, contactName, contactEmail, phone } = await request.json()

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
            <div style="margin-top: 24px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://aruba-deals.vercel.app'}/manage-x9k4" style="display: inline-block; background: #f97316; color: white; font-weight: 700; padding: 12px 32px; border-radius: 10px; text-decoration: none;">
                Review in Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
