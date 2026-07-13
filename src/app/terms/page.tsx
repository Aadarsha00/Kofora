import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Effective Date: April 10, 2026</p>

        <div className="mt-6 space-y-4 text-sm leading-7 text-gray-700">
          <p>
            This website is operated by Kofora, a brand under Planet Living
            Ventures LLC. Throughout the site, the terms &ldquo;we&rdquo;,
            &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to Kofora. By visiting our
            site and/or purchasing something from us, you engage in our
            &ldquo;Service&rdquo; and agree to be bound by the following Terms of
            Service.
          </p>
          <p>
            These Terms apply to all users of the site, including without
            limitation users who are browsers, customers, merchants, and
            contributors of content.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">1. Online Store Terms</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              By agreeing to these Terms of Service, you represent that you are at
              least the age of majority in your state or province of residence, or
              that you have given us your consent to allow any of your minor
              dependents to use this site.
            </p>
            <p>
              You may not use our products for any illegal or unauthorized purpose
              nor may you violate any laws in your jurisdiction.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">2. General Conditions</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>We reserve the right to refuse service to anyone for any reason at any time.</p>
            <p>
              You understand that your content, not including payment information,
              may be transferred unencrypted and involve transmissions over
              various networks. Payment information is always encrypted during
              transfer.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">3. Accuracy of Information</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We are not responsible if information made available on this site is
              not accurate, complete, or current. The material on this site is
              provided for general information only.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">4. Products and Services</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Certain products or services may be available exclusively online
              through the website. These products may have limited quantities and
              are subject to return or exchange only according to our Return
              Policy.
            </p>
            <p>
              We reserve the right to limit the sales of our products or services
              to any person, geographic region, or jurisdiction.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">5. Pricing and Billing</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              All prices are subject to change without notice. We reserve the
              right to modify or discontinue products at any time.
            </p>
            <p>
              You agree to provide current, complete, and accurate purchase and
              account information for all purchases made at our store.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">6. Third-Party Services</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Our store is hosted on Shopify Inc. They provide us with the online
              e-commerce platform that allows us to sell our products.
            </p>
            <p>
              We may also use third-party services such as payment providers,
              analytics tools, and marketing platforms. We are not responsible for
              the practices of these third parties.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">7. User Comments and Feedback</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              If you send us submissions, comments, or feedback, you agree that we
              may use, edit, and publish them without restriction.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">8. Personal Information</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Your submission of personal information through the store is governed
              by our{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">9. Prohibited Uses</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>You are prohibited from using the site or its content:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>For any unlawful purpose</li>
              <li>To solicit others to perform unlawful acts</li>
              <li>To violate any laws or regulations</li>
              <li>To infringe upon intellectual property rights</li>
              <li>To upload harmful code or malware</li>
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">10. Disclaimer of Warranties</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We do not guarantee that your use of our service will be
              uninterrupted, timely, secure, or error-free.
            </p>
            <p>
              All products and services are provided &ldquo;as is&rdquo; and
              &ldquo;as available&rdquo; without any warranties, express or
              implied.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">11. Limitation of Liability</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              In no case shall Kofora, Planet Living Ventures LLC, or its
              affiliates be liable for any direct, indirect, incidental, or
              consequential damages arising from your use of our service or
              products.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">12. Indemnification</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              You agree to indemnify and hold harmless Kofora and its affiliates
              from any claim arising out of your breach of these Terms or violation
              of any law.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">13. Governing Law</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the State of Florida, United States.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">14. Changes to Terms</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We reserve the right to update, change, or replace any part of these
              Terms of Service at any time.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">15. Contact Information</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <address className="not-italic">
              Planet Living Ventures LLC
              <br />
              1724 Buckingham Ct
              <br />
              Tallahassee, FL 32308
              <br />
              United States
              <br />
              <br />
              Email: contact@kofora.com
              <br />
              Phone: (844) 660-8987
            </address>
          </div>
        </section>

        <Link
          href="/contact"
          className="mt-10 inline-block bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Contact support
        </Link>
      </div>
    </main>
  );
}
