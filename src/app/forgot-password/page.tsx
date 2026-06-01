"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/api/auth.api";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Could not send reset instructions.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword({ email });
      setMessage("If an account exists for that email, reset instructions have been sent.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black md:px-8">
      <form onSubmit={handleSubmit} className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter your account email and we will send password reset instructions.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="mt-6 w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
        {message && <p className="mt-3 text-sm font-semibold text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
        <Link href="/" className="mt-5 inline-block text-sm font-semibold underline">
          Back to shopping
        </Link>
      </form>
    </main>
  );
}
