import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: March 1, 2025</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                ArubaSave (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it when you use our platform at arubasave.com (the &quot;Service&quot;).
              </p>
              <p className="mt-3">
                By using ArubaSave, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="font-semibold text-gray-800 mb-2">Information you provide directly:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Full name and email address when you register an account</li>
                <li>Business details (name, location, category, contact information) when registering as a business</li>
                <li>Messages you send through our support contact form</li>
              </ul>
              <p className="font-semibold text-gray-800 mt-4 mb-2">Information collected automatically:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Usage data such as pages visited, deals viewed, and vouchers claimed</li>
                <li>Device information (browser type, operating system, IP address)</li>
                <li>Cookies and similar tracking technologies used to maintain your session</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Create and manage your account</li>
                <li>Generate and deliver digital vouchers</li>
                <li>Process business registrations and communicate approval decisions</li>
                <li>Respond to support messages and inquiries</li>
                <li>Improve the functionality and user experience of the Service</li>
                <li>Send transactional emails related to your account or vouchers</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="mt-3">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing of Information</h2>
              <p>We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li><strong>Service providers:</strong> We use Supabase for database hosting and authentication, and Resend for transactional email delivery. These providers process data on our behalf under strict confidentiality terms.</li>
                <li><strong>Businesses:</strong> When you redeem a voucher, the business may see that a voucher for their deal has been used. No additional personal data is shared beyond what is necessary for redemption.</li>
                <li><strong>Legal requirements:</strong> We may disclose your information if required by law, court order, or governmental authority.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
              <p>
                We retain your personal data for as long as your account is active or as needed to provide you with the Service. If you wish to delete your account, please contact us at storeroro07@gmail.com. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
              <p>
                ArubaSave uses session cookies strictly necessary for authentication. We do not use advertising or tracking cookies. You may disable cookies through your browser settings, but doing so may prevent you from logging in or using certain features of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Security</h2>
              <p>
                We implement industry-standard security measures including encrypted connections (HTTPS), secure authentication via Supabase Auth, and row-level security policies on our database. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at <strong>storeroro07@gmail.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
              <p>
                ArubaSave is not directed at individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify users of any significant changes by updating the &quot;Last updated&quot; date at the top of this page. Continued use of the Service after changes constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">ArubaSave</p>
                <p>Aruba, ABC Islands</p>
                <p>Email: storeroro07@gmail.com</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
