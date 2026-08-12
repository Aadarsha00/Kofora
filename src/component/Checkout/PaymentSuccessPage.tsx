"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock, ShoppingBag } from "lucide-react";
import { capturePayPalOrder, confirmStripeCheckoutSession } from "@/api/checkout.api";
import { PaymentTransaction } from "@/interface/checkout";
import { Cart } from "@/interface/cart";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function money(currency: string, value: number | string | undefined): string {
  const amount = Number(value ?? 0);
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const clearGuestCart = useGuestCartStore((state) => state.clearCart);
  const confirmationStarted = useRef(false);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [error, setError] = useState("");

  const provider = searchParams.get("provider");
  const orderId = Number(searchParams.get("order_id"));
  const stripeSessionId = searchParams.get("session_id");
  const payPalPaymentId = searchParams.get("paymentId");
  const payPalPayerId = searchParams.get("PayerID");

  const stripeMutation = useMutation({ mutationFn: confirmStripeCheckoutSession });
  const paypalMutation = useMutation({ mutationFn: capturePayPalOrder });
  const isProcessing = stripeMutation.isPending || paypalMutation.isPending || authLoading;

  const paymentLabel = provider === "paypal" ? "PayPal" : "card";
  const hasRequiredParams = useMemo(() => {
    if (!provider || !orderId) return false;
    if (provider === "stripe") return Boolean(stripeSessionId);
    if (provider === "paypal") return Boolean(payPalPaymentId && payPalPayerId);
    return false;
  }, [orderId, payPalPayerId, payPalPaymentId, provider, stripeSessionId]);

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !hasRequiredParams ||
      transaction ||
      error ||
      confirmationStarted.current
    ) {
      return;
    }

    confirmationStarted.current = true;

    const handleSuccess = (data: PaymentTransaction) => {
      setTransaction(data);
      clearGuestCart();
      queryClient.setQueryData<Cart | undefined>(["cart"], (current) =>
        current
          ? {
              ...current,
              variant_items: [],
              bundle_items: [],
              applied_coupon: null,
              applied_discount_claim: null,
              totals: {
                subtotal: 0,
                discount: 0,
                shipping: 0,
                tax: 0,
                total: 0,
              },
            }
          : current
      );
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.replace("/orders");
    };

    const handleError = (err: unknown, fallback: string) => {
      const message = getErrorMessage(err, fallback);
      if (message === "Network Error") {
        clearGuestCart();
        queryClient.removeQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        router.replace("/orders");
        return;
      }
      confirmationStarted.current = false;
      setError(message);
    };

    if (provider === "stripe" && stripeSessionId) {
      stripeMutation.mutate(
        {
          order_id: orderId,
          provider_payment_id: stripeSessionId,
        },
        {
          onSuccess: handleSuccess,
          onError: (err) => handleError(err, "We could not confirm your card payment."),
        }
      );
    }

    if (provider === "paypal" && payPalPaymentId && payPalPayerId) {
      paypalMutation.mutate(
        {
          order_id: orderId,
          provider_payment_id: payPalPaymentId,
          payer_id: payPalPayerId,
        },
        {
          onSuccess: handleSuccess,
          onError: (err) => handleError(err, "We could not capture your PayPal payment."),
        }
      );
    }
  }, [
    authLoading,
    clearGuestCart,
    error,
    hasRequiredParams,
    isAuthenticated,
    orderId,
    payPalPayerId,
    payPalPaymentId,
    paypalMutation,
    provider,
    queryClient,
    router,
    stripeMutation,
    stripeSessionId,
    transaction,
  ]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl text-sm text-gray-500">Confirming payment...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl border border-gray-200 bg-gray-50 p-8">
          <AlertCircle className="mb-4 text-amber-700" size={28} />
          <h1 className="text-2xl font-bold text-black">Sign in to confirm payment</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your payment provider returned successfully, but this browser is not signed in.
          </p>
          <Link href="/checkout" className="mt-6 inline-block inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white">
            Return to checkout
          </Link>
        </div>
      </main>
    );
  }

  if (!hasRequiredParams) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl border border-gray-200 bg-gray-50 p-8">
          <AlertCircle className="mb-4 text-red-700" size={28} />
          <h1 className="text-2xl font-bold text-black">Payment details missing</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            We could not find the payment reference needed to confirm this order.
          </p>
          <Link href="/checkout" className="mt-6 inline-block inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white">
            Return to checkout
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl border border-red-200 bg-red-50 p-8">
          <AlertCircle className="mb-4 text-red-700" size={28} />
          <h1 className="text-2xl font-bold text-black">Payment needs attention</h1>
          <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/checkout" className="inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white">
              Return to checkout
            </Link>
            <Link href="/cart" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-black">
              View bag
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isProcessing || !transaction) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl border border-gray-200 bg-gray-50 p-8">
          <Clock className="mb-4 text-gray-700" size={28} />
          <h1 className="text-2xl font-bold text-black">Confirming your payment</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Please wait while we verify your {paymentLabel} payment and prepare your order.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl border border-gray-200 bg-gray-50 p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 size={26} />
        </div>
        <h1 className="text-2xl font-bold text-black">Payment confirmed</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Thank you. Your order is paid and will move into processing. Your bag has been cleared.
        </p>

        <div className="mt-6 grid gap-3 border-t border-gray-200 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Order</span>
            <span className="font-semibold text-black">#{transaction.order}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment method</span>
            <span className="font-semibold capitalize text-black">{transaction.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount paid</span>
            <span className="font-semibold text-black">{money(transaction.currency, transaction.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold capitalize text-green-700">{transaction.status}</span>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white">
            <ShoppingBag size={16} />
            Continue shopping
          </Link>
          <Link href="/cart" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-black">
            View bag
          </Link>
        </div>
      </div>
    </main>
  );
}
