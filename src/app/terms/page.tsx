import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="mt-4 text-sm leading-7 text-gray-700">
          Purchases from Kofora are subject to product availability, payment
          confirmation, shipping rules, and the return policy shown at checkout.
          Order-specific questions can be handled by support.
        </p>
        <Link href="/contact" className="mt-6 inline-block bg-black px-5 py-3 text-sm font-semibold text-white">
          Contact support
        </Link>
      </div>
    </main>
  );
}
