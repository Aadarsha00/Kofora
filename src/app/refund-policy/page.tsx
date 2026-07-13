import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Refund Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Effective Date: April 10, 2026</p>

        <div className="mt-6 space-y-4 text-sm leading-7 text-gray-700">
          <p>
            This Return and Refund Policy applies to purchases made from Kofora, a
            brand under Planet Living Ventures LLC, through www.kofora.com.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">1. Returns</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>We accept returns within 30 days of delivery.</p>
            <p>To be eligible for a return, items must be:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Unused and unworn</li>
              <li>In original condition</li>
              <li>In original packaging</li>
            </ul>
            <p>
              Items that do not meet these conditions may not be eligible for a
              refund or exchange.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">2. Non-Returnable Items</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>We do not accept returns for:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Items marked as final sale</li>
              <li>Used or worn products</li>
              <li>Gift cards</li>
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">3. Return Process</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              To initiate a return, please contact us at contact@kofora.com with
              your order number and reason for return.
            </p>
            <p>
              If your return is approved, we will provide instructions on how to
              return your item.
            </p>
            <p>
              Customers are responsible for return shipping costs unless the item
              is defective or incorrect.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">4. Refunds</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              Once we receive and inspect your returned item, we will notify you of
              the approval or rejection of your refund.
            </p>
            <p>If approved:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Refunds will be issued to your original payment method</li>
              <li>Processing time is typically 5&ndash;10 business days</li>
            </ul>
            <p>
              Shipping costs are non-refundable unless the return is due to our
              error, such as a defective or incorrect item.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">5. Exchanges</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>We only replace items if they are defective or damaged.</p>
            <p>
              If you need to exchange an item, please contact us at
              contact@kofora.com.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">6. Late or Missing Refunds</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              If you have not received your refund after the processing period:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Check your bank account again</li>
              <li>Contact your credit card company</li>
              <li>Contact your bank</li>
            </ul>
            <p>
              If you have completed all of the above and still have not received
              your refund, please contact us.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">7. Damaged or Incorrect Items</h2>
          <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              If you receive a defective, damaged, or incorrect item, please
              contact us within 7 days of delivery.
            </p>
            <p>
              Include photos of the issue so we can resolve it as quickly as
              possible.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">8. Contact Information</h2>
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
          Start a request
        </Link>
      </div>
    </main>
  );
}
