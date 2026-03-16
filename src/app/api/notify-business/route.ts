import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { businessName, contactEmail, status } = await request.json()

  const approved = status === 'approved'

  try {
    await resend.emails.send({
      from: 'ArubaSave <onboarding@resend.dev>',
      to: contactEmail,
      subject: approved
        ? `Great news! ${businessName} has been approved on ArubaSave`
        : `Update on your ArubaSave application`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${approved ? '#f97316, #ec4899' : '#6b7280, #4b5563'}); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${approved ? 'You\'re approved! 🎉' : 'Application Update'}</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">ArubaSave</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            ${approved
              ? `<p style="color: #111827; font-size: 16px;">Hi there! We're excited to let you know that <strong>${businessName}</strong> has been approved on ArubaSave.</p>
                 <p style="color: #6b7280;">You can now log in to your business dashboard and start posting deals for your customers.</p>
                 <div style="margin-top: 24px; text-align: center;">
                   <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://aruba-deals.vercel.app'}/business/dashboard" style="display: inline-block; background: #f97316; color: white; font-weight: 700; padding: 12px 32px; border-radius: 10px; text-decoration: none;">
                     Go to Your Dashboard
                   </a>
                 </div>`
              : `<p style="color: #111827; font-size: 16px;">Hi there, thank you for applying to list <strong>${businessName}</strong> on ArubaSave.</p>
                 <p style="color: #6b7280;">After reviewing your application, we're unable to approve it at this time. Feel free to contact us at storeroro07@gmail.com if you have any questions.</p>`
            }
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
