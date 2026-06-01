import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Refund Policy</h1>
        <p className="mt-4 text-sm leading-7 text-gray-700">
          If an order arrives damaged, incorrect, or unsuitable, contact support
          with your order number. The team will review replacement, return, or
          refund options based on the order status and item condition.
        </p>
        <Link href="/contact" className="mt-6 inline-block bg-black px-5 py-3 text-sm font-semibold text-white">
          Start a request
        </Link>
      </div>
    </main>
  );
}
