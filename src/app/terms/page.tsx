import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: March 1, 2025</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using ArubaSave (&quot;the Service&quot;), operated by ArubaSave (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p className="mt-3">
                We reserve the right to modify these Terms at any time. Continued use of the Service after any modifications constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
              <p>
                ArubaSave is an online platform that connects consumers with local businesses in Aruba by offering discounted deals redeemable through digital QR code vouchers. ArubaSave acts solely as an intermediary between customers and participating businesses and is not a party to any transaction between them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Eligibility</h2>
              <p>
                You must be at least 18 years of age to create an account and use the Service. By using ArubaSave, you represent and warrant that you meet this age requirement. Accounts created on behalf of minors are prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. User Accounts</h2>
              <p>
                To claim deals and access vouchers, you must register for an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and up-to-date information during registration</li>
              </ul>
              <p className="mt-3">
                You acknowledge that password recovery is not available. You are solely responsible for remembering your password. ArubaSave is not liable for any loss resulting from your failure to maintain account security.
              </p>
              <p className="mt-3">
                We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or abuse the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Vouchers and Deals</h2>
              <p className="font-semibold text-gray-800 mb-2">For customers:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Each user may hold a maximum of 3 active vouchers at any time.</li>
                <li>Vouchers are non-transferable and may only be redeemed by the account holder.</li>
                <li>Vouchers are valid until the stated expiration date. Expired vouchers cannot be redeemed.</li>
                <li>Once a voucher has been marked as &quot;used,&quot; it cannot be reversed or reissued.</li>
                <li>ArubaSave does not guarantee the availability of any particular deal. Deals may sell out or expire at any time.</li>
                <li>ArubaSave is not responsible for disputes between customers and businesses regarding the quality of goods or services rendered.</li>
              </ul>
              <p className="font-semibold text-gray-800 mt-4 mb-2">For businesses:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Businesses must be approved by ArubaSave before listing deals.</li>
                <li>Businesses are solely responsible for honoring the deals they list, including the stated discount and inclusions.</li>
                <li>ArubaSave reserves the right to remove any deal or suspend any business account that violates these Terms or engages in misleading practices.</li>
                <li>Businesses must not list deals that are illegal, fraudulent, or in violation of applicable Aruban laws and regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Payments</h2>
              <p>
                ArubaSave currently operates as a free-to-use discovery platform. Vouchers are claimed at no charge through the platform. Any payment for goods or services is made directly between the customer and the business at the time of redemption. ArubaSave is not responsible for payment disputes, refunds, or chargebacks between customers and businesses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                <li>Create multiple accounts to circumvent the 3-voucher limit or other restrictions</li>
                <li>Attempt to copy, duplicate, or resell voucher QR codes</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Scrape, crawl, or harvest data from the platform without express written permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
              <p>
                All content on ArubaSave, including but not limited to logos, text, graphics, software, and design elements, is the exclusive property of ArubaSave or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on the Service without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="mt-3">
                ArubaSave does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not warrant the accuracy or completeness of any deal listings, business information, or other content on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, ARUBASAVE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="mt-3">
                Our total liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed USD $50.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Aruba (Kingdom of the Netherlands), without regard to its conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Aruba.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Upon termination, all licenses and rights granted to you under these Terms will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
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
