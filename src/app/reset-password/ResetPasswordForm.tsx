"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/api/auth.api";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Could not reset password.";
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, new_password: password });
      setMessage("Your password has been reset. You can log in with the new password.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Set New Password</h1>
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="New password"
        className="mt-6 w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
      />
      {message && <p className="mt-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Reset password"}
      </button>
      <Link href="/" className="mt-5 inline-block text-sm font-semibold underline">
        Back to shopping
      </Link>
    </form>
  );
}
