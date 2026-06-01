import Link from "next/link";

export default function CookieSettingsPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Cookie Settings</h1>
        <p className="mt-4 text-sm leading-7 text-gray-700">
          Kofora uses essential cookies for account, cart, checkout, and site
          security. Marketing preferences can be updated from your profile or
          by contacting support.
        </p>
        <Link href="/profile" className="mt-6 inline-block bg-black px-5 py-3 text-sm font-semibold text-white">
          Manage profile
        </Link>
      </div>
    </main>
  );
}
