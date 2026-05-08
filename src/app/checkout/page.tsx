import { Suspense } from "react";
import CheckoutPage from "@/component/Checkout/CheckoutPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-6 py-16">
          <div className="mx-auto max-w-5xl text-sm text-gray-500">Loading checkout...</div>
        </main>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}
