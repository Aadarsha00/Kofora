import { Suspense } from "react";
import PaymentSuccessPage from "@/component/Checkout/PaymentSuccessPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-6 py-16">
          <div className="mx-auto max-w-3xl text-sm text-gray-500">Confirming payment...</div>
        </main>
      }
    >
      <PaymentSuccessPage />
    </Suspense>
  );
}
