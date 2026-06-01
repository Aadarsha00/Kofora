import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-gray-700">
          Kofora uses customer information to process orders, provide support,
          improve the shopping experience, and send marketing only when consent
          has been provided. Contact us if you need help with your data or
          communication preferences.
        </p>
        <Link href="/contact" className="mt-6 inline-block bg-black px-5 py-3 text-sm font-semibold text-white">
          Contact support
        </Link>
      </div>
    </main>
  );
}
