import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Effective Date: April 10, 2026</p>

        <div className="mt-6 space-y-4 text-sm leading-7 text-gray-700">
          <p>
            At Kofora, a brand under Planet Living Ventures LLC (&ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we are committed to protecting
            your privacy and handling your personal information with transparency
            and care. This Privacy Policy describes how we collect, use, and
            disclose your personal information when you visit or make a purchase
            from www.kofora.com (the &ldquo;Site&rdquo;).
          </p>
          <p>
            This policy applies to all customers located in the United States and
            Canada. By visiting or shopping on our Site, you agree to the
            practices described in this policy.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Personal Information We Collect</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              At Kofora, we collect only the information necessary to deliver a
              smooth, secure, and personalized shopping experience.
            </p>
            <p>The personal data we gather falls into three main categories:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Information you provide directly</li>
              <li>Information collected automatically</li>
              <li>Information gathered through cookies and tracking technologies</li>
            </ul>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Information You Provide Directly</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We collect personal information that you willingly share with us
              when you visit, register, or make a purchase on www.kofora.com.
            </p>
            <p>This may include:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping address</li>
              <li>Order and purchase details</li>
            </ul>
            <p>
              We use this information solely to process your transactions, fulfill
              your orders, and communicate with you effectively. We do not collect
              more information than is necessary to serve you.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Automatically Collected Information</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              When you visit www.kofora.com, certain technical information is
              collected automatically through our servers and analytics tools.
            </p>
            <p>This may include:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages viewed and interactions on the Site</li>
              <li>Date and time of visits</li>
              <li>Approximate geographic location based on IP address</li>
            </ul>
            <p>
              This data helps us understand how customers use our Site, improve
              performance, and maintain a secure browsing experience. It is
              generally analyzed in aggregate and is not used to personally
              identify you without your consent.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Cookies and Tracking Technologies</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We use cookies, pixels, and similar tracking technologies to ensure
              our Site operates efficiently and to provide you with a personalized
              shopping experience.
            </p>
            <p>These technologies help us:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Remember your preferences and cart contents</li>
              <li>Analyze Site usage</li>
              <li>Monitor performance</li>
              <li>Serve relevant advertisements based on your interests</li>
            </ul>
            <p>
              You may adjust, restrict, or disable cookies at any time through
              your browser settings. Please note that disabling certain cookies
              may affect Site functionality, such as saving your cart or
              remembering your login details.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Payment Information</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              At Kofora, the security of your financial information is extremely
              important to us.
            </p>
            <p>
              All payments made through www.kofora.com are processed exclusively
              by trusted third-party payment providers, including:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Shopify Payments</li>
              <li>Stripe</li>
              <li>PayPal</li>
            </ul>
            <p>
              These providers use industry-standard encryption and security
              practices. We do not store, view, or have access to your full
              payment card details at any point during or after your transaction.
            </p>
            <p>
              All sensitive financial data is handled entirely by our payment
              partners in accordance with PCI-DSS compliance standards.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">How We Use Your Personal Information</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We use your personal information responsibly and only for purposes
              that directly support your experience with us.
            </p>
            <p>Your information may be used to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Process and fulfill your orders</li>
              <li>Provide customer support</li>
              <li>Send order confirmations, shipping notifications, and delivery updates</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Maintain Site security</li>
              <li>
                Send marketing communications, promotional offers, and
                personalized advertising, where permitted by law or with your
                consent
              </li>
            </ul>
            <p>
              You may opt out of marketing emails at any time by clicking the
              unsubscribe link in any email or by contacting us directly.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Order Processing and Fulfillment</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              When you place an order on www.kofora.com, we use your personal
              information to:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Verify and process your payment securely</li>
              <li>Prepare your items for shipment</li>
              <li>Coordinate delivery through trusted shipping partners</li>
              <li>Ensure your order is delivered accurately and on time</li>
            </ul>
            <p>
              We also use your information to keep you updated throughout the
              fulfillment process.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Customer Support</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We use your information to identify your account and order history
              so our support team can assist you accurately and efficiently.
            </p>
            <p>
              Whether you need help with an order, a return, or a general inquiry,
              your information allows us to provide support as quickly and
              effectively as possible.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Purchase Communications</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We use your information to confirm your orders and keep you informed
              about:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Order confirmations</li>
              <li>Shipping notifications</li>
              <li>Delivery updates</li>
              <li>Changes related to your purchase</li>
            </ul>
            <p>
              We only contact you with information that is relevant and useful to
              your transaction or account.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Website and Service Improvement</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Your browsing behavior helps us understand what is working well and
              what can be improved on www.kofora.com.
            </p>
            <p>We use this information to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Identify technical issues</li>
              <li>Improve features and usability</li>
              <li>Enhance performance</li>
              <li>Deliver a better overall shopping experience</li>
            </ul>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Fraud Prevention and Security</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We use your information to protect your account from unauthorized
              access and to monitor for suspicious activity or potential fraud.
            </p>
            <p>
              If unusual activity is detected, we may take immediate action to
              secure your account and notify you as appropriate.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Marketing and Promotions</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              With your permission, we may use your information to send you:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Promotional offers</li>
              <li>Seasonal campaigns</li>
              <li>New arrival announcements</li>
              <li>Kofora updates and news</li>
            </ul>
            <p>You may unsubscribe from marketing communications at any time.</p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Targeted Advertising</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We may use your data to better understand your shopping preferences
              and deliver advertisements that are more relevant to your interests.
            </p>
            <p>
              You may opt out of targeted advertising through your browser or
              device settings, or through the advertising preference tools listed
              below.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Your Marketing Preferences</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>You may opt out of marketing communications at any time by:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Clicking Unsubscribe at the bottom of any marketing email</li>
              <li>Contacting us at privacy@kofora.com</li>
              <li>Updating your preferences in your account settings</li>
            </ul>
            <p>
              Please note that opting out of marketing emails does not affect
              transactional communications related to your orders.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Sharing Your Personal Information</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              At Kofora, we share your personal information only when necessary to
              operate our business and serve you effectively.
            </p>
            <p>Your information may be shared with:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Shopify, to power and manage our online store</li>
              <li>Stripe, PayPal, and Shopify Payments, to process payments</li>
              <li>Shipping and fulfillment partners, to deliver your orders</li>
              <li>Analytics providers, such as Google, to improve our Site</li>
              <li>
                Advertising partners, such as Meta, to help deliver relevant
                content and advertising
              </li>
            </ul>
            <p>We do not sell your personal information to anyone.</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Behavioral Advertising</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We may use cookies and related technologies to deliver
              advertisements tailored to your browsing activity and interests
              across third-party platforms.
            </p>
            <p>
              If you prefer not to receive personalized advertisements, you may
              opt out through the following services:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Facebook Ads Settings</li>
              <li>Google Ads Settings</li>
              <li>Digital Advertising Alliance (DAA)</li>
            </ul>
            <p>Please note:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Opting out does not stop all advertising</li>
              <li>You may still see generic, non-personalized ads</li>
              <li>
                Opt-out preferences may apply only to the specific device or
                browser where they are set
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Data Retention</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We retain your personal information only for as long as necessary
              to:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Fulfill your orders and provide our services</li>
              <li>
                Meet legal and regulatory obligations in the United States and
                Canada
              </li>
              <li>Resolve disputes</li>
              <li>Enforce our terms and agreements</li>
            </ul>
            <p>
              Once your data is no longer required for these purposes, it is
              securely deleted or anonymized in accordance with our internal
              retention practices.
            </p>
            <p>
              You may also request deletion of your personal data at any time by
              contacting privacy@kofora.com.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Your Rights (USA and Canada)</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Kofora, operating under Planet Living Ventures LLC, respects and
              upholds the privacy rights of customers in the United States and
              Canada in accordance with applicable laws.
            </p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">United States</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Depending on your state of residence, including California under the
              California Consumer Privacy Act (CCPA), you may have the right to:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Access the personal data we hold about you</li>
              <li>Request corrections or deletions</li>
              <li>Opt out of marketing communications</li>
              <li>
                Receive information about how your data is collected, used, and
                shared
              </li>
            </ul>
            <p>We will respond to verified requests within 30 days.</p>
          </div>

          <h3 className="mt-6 text-lg font-semibold">Canada</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              If you are located in Canada, your rights are protected under the
              Personal Information Protection and Electronic Documents Act
              (PIPEDA).
            </p>
            <p>You may have the right to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Request access to your personal data</li>
              <li>Request corrections to inaccurate information</li>
              <li>Withdraw consent for marketing communications at any time</li>
            </ul>
          </div>

          <h3 className="mt-6 text-lg font-semibold">How to Exercise Your Rights</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              To submit a privacy request or exercise any of your rights, please
              contact our privacy team at:
            </p>
            <p>privacy@kofora.com</p>
            <p>
              We will acknowledge your request within 5 business days and provide
              a full response within 30 days of receipt.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Data Security</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information, including:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>SSL encryption</li>
              <li>Restricted access controls</li>
              <li>PCI-DSS compliant payment processing</li>
            </ul>
            <p>
              While we take reasonable steps to protect your data, no system of
              electronic transmission or storage can be guaranteed to be 100%
              secure.
            </p>
            <p>
              In the event of a data breach affecting your personal information,
              we will notify you promptly and take immediate action as required.
            </p>
            <p>
              We also encourage you to protect your account by using a strong,
              unique password and keeping your login credentials confidential.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Third-Party Links</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Our Site may contain links to third-party websites for your
              convenience and reference.
            </p>
            <p>
              These sites are independently owned and operated and are not
              controlled by Kofora or Planet Living Ventures LLC. We are not
              responsible for their content, privacy practices, or security
              standards.
            </p>
            <p>
              We encourage you to review the privacy policy of any third-party
              website before sharing personal information or completing
              transactions.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Children&apos;s Privacy</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Kofora&apos;s products and services are not directed to individuals
              under the age of 13.
            </p>
            <p>
              In accordance with the Children&apos;s Online Privacy Protection Act
              (COPPA) and applicable Canadian privacy laws, we do not knowingly
              collect, use, or disclose personal information from children under
              13 without verifiable parental consent.
            </p>
            <p>
              If you are a parent or guardian and believe that a child has
              provided us with personal information, please contact us immediately
              at privacy@kofora.com.
            </p>
            <p>
              Upon verification, we will promptly delete such information from our
              records.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Do Not Track</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              At this time, Kofora does not alter its data collection or usage
              practices in response to Do Not Track browser signals.
            </p>
            <p>
              Because there is currently no universally accepted legal or
              technical standard for responding to such signals, our Site does not
              currently respond to them.
            </p>
            <p>
              If you wish to limit tracking, you may manage your cookie
              preferences through your browser settings or opt out of targeted
              advertising through the tools listed above.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Changes to This Policy</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Planet Living Ventures LLC reserves the right to modify or update
              this Privacy Policy at any time to reflect changes in business
              practices, services, or legal requirements.
            </p>
            <p>
              When updates are made, the revised policy will be posted on this
              page with an updated effective date.
            </p>
            <p>For material changes, we may also provide additional notice, such as:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Email notification</li>
              <li>A prominent notice on our Site</li>
            </ul>
            <p>
              Your continued use of www.kofora.com after any updates constitutes
              your acceptance of the revised Privacy Policy.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or how we handle your personal information, please
              contact us:
            </p>
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
              Email: privacy@kofora.com
            </address>
            <p>
              We aim to respond to all privacy-related inquiries within 30
              business days of receipt.
            </p>
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
