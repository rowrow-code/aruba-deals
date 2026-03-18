import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { businessName, contactEmail, status } = await request.json()

  const approved = status === 'approved'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aruba-deals.vercel.app'

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${approved ? '#f97316, #ec4899' : '#6b7280, #4b5563'}); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${approved ? "You're approved! 🎉" : 'Application Update'}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">ArubaSave</p>
      </div>
      <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
        ${approved
          ? `<p style="color: #111827; font-size: 16px;">Hi there! We're excited to let you know that <strong>${businessName}</strong> has been approved on ArubaSave.</p>
             <p style="color: #6b7280;">You can now log in to your business dashboard and start posting deals for your customers.</p>
             <div style="margin-top: 24px; text-align: center;">
               <a href="${siteUrl}/business/dashboard" style="display: inline-block; background: #f97316; color: white; font-weight: 700; padding: 12px 32px; border-radius: 10px; text-decoration: none;">
                 Go to Your Dashboard
               </a>
             </div>`
          : `<p style="color: #111827; font-size: 16px;">Hi there, thank you for applying to list <strong>${businessName}</strong> on ArubaSave.</p>
             <p style="color: #6b7280;">After reviewing your application, we're unable to approve it at this time. Feel free to contact us at storeroro07@gmail.com if you have any questions.</p>`
        }
      </div>
    </div>
  `

  try {
    // Send to business owner
    await resend.emails.send({
      from: 'ArubaSave <onboarding@resend.dev>',
      to: contactEmail,
      subject: approved
        ? `Great news! ${businessName} has been approved on ArubaSave`
        : `Update on your ArubaSave application`,
      html,
    })
  } catch (error) {
    console.error('Email to business owner failed:', error)
    // Don't return error yet — we still want to send the admin copy
  }

  // Always CC admin so we can verify delivery (Resend free tier only delivers to storeroro07@gmail.com)
  try {
    await resend.emails.send({
      from: 'ArubaSave <onboarding@resend.dev>',
      to: 'storeroro07@gmail.com',
      subject: `[Admin Copy] ${businessName} — ${approved ? 'APPROVED' : 'REJECTED'} (sent to ${contactEmail})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1f2937; padding: 16px 24px; border-radius: 12px 12px 0 0;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">Admin copy — business notification</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="color: #111827; font-size: 15px;">
              <strong>${businessName}</strong> was <strong style="color: ${approved ? '#16a34a' : '#dc2626'}">${approved ? 'approved' : 'rejected'}</strong>.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
              Notification email sent to: <strong>${contactEmail}</strong>
            </p>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 12px;">
              Note: If the business email address is not storeroro07@gmail.com, the owner may not have received this email (Resend free tier restriction). Follow up manually if needed.
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Admin copy email failed:', error)
  }

  return NextResponse.json({ success: true })
}
