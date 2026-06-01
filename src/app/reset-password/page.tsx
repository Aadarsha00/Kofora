import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <Suspense fallback={<div className="mx-auto max-w-md text-sm text-gray-500">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
