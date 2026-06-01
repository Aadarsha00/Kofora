"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Clock, PackageCheck, Truck } from "lucide-react";
import { getMyOrders } from "@/api/checkout.api";
import { Order } from "@/interface/checkout";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  returned: "Returned",
};

function money(currency: string, value: number | string | undefined): string {
  const amount = Number(value ?? 0);
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDeliveryStep(status: string): number {
  if (status === "delivered") return 3;
  if (status === "shipped") return 2;
  if (status === "processing" || status === "paid") return 1;
  return 0;
}

function StatusBadge({ status }: { status: string }) {
  const isGood = ["paid", "processing", "shipped", "delivered"].includes(status);
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isGood ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function DeliveryProgress({ order }: { order: Order }) {
  const currentStep = getDeliveryStep(order.fulfillment_status);
  const steps = [
    { label: "Order placed", icon: Clock },
    { label: "Processing", icon: PackageCheck },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: PackageCheck },
  ];

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const active = index <= currentStep;
        return (
          <div
            key={step.label}
            className={`border p-3 text-xs ${
              active ? "border-black bg-white text-black" : "border-gray-200 bg-gray-50 text-gray-400"
            }`}
          >
            <Icon size={16} className="mb-2" />
            <span className="font-semibold">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="border border-gray-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Order</p>
          <h2 className="mt-1 text-lg font-bold text-black">{order.order_number}</h2>
          <p className="mt-1 text-sm text-gray-500">Placed {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.payment_status} />
          <StatusBadge status={order.fulfillment_status} />
        </div>
      </div>

      <DeliveryProgress order={order} />

      <div className="mt-5 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 text-sm">
            <div>
              <p className="font-semibold text-black">{item.product_name}</p>
              <p className="mt-1 text-gray-500">
                {item.color} / {item.size} x {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-black">{money(order.currency, item.line_total)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Payment</span>
          <span className="font-semibold capitalize text-black">{order.payment_status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Delivery status</span>
          <span className="font-semibold text-black">{STATUS_LABELS[order.fulfillment_status] ?? order.fulfillment_status}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="font-bold text-black">Total</span>
          <span className="font-bold text-black">{money(order.currency, order.grand_total)}</span>
        </div>
      </div>
    </article>
  );
}

function isConfirmedOrder(order: Order): boolean {
  return (
    order.payment_status === "paid" ||
    ["processing", "shipped", "delivered"].includes(order.fulfillment_status)
  );
}

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: getMyOrders,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl text-sm text-gray-500">Loading orders...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl border border-gray-200 bg-gray-50 p-8">
          <h1 className="text-2xl font-bold text-black">Sign in to view your orders</h1>
          <p className="mt-3 text-sm text-gray-600">Your order and delivery status are available after login.</p>
          <Link href="/" className="mt-6 inline-block bg-black px-5 py-3 text-sm font-semibold text-white">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  const orders = ordersQuery.data ?? [];
  const confirmedOrders = orders.filter(isConfirmedOrder);
  const pendingAttempts = orders.filter((order) => !isConfirmedOrder(order));

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
          <ArrowLeft size={16} />
          Back to shopping
        </Link>

        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-black">My orders</h1>
          <p className="mt-2 text-sm text-gray-500">Track payment, processing, shipping, and delivery status.</p>
        </div>

        {ordersQuery.isLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">Loading orders...</div>
        ) : confirmedOrders.length === 0 ? (
          <div className="border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-lg font-semibold text-black">No confirmed orders yet.</p>
            {pendingAttempts.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                You have {pendingAttempts.length} unpaid checkout attempt{pendingAttempts.length === 1 ? "" : "s"}.
              </p>
            )}
            <Link href="/" className="mt-5 inline-block bg-black px-5 py-3 text-sm font-semibold text-white">
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {confirmedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {pendingAttempts.length > 0 && (
              <div className="mt-8 border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 text-amber-700" size={18} />
                  <div>
                    <h2 className="text-sm font-bold text-black">Unpaid checkout attempts</h2>
                    <p className="mt-1 text-sm text-amber-800">
                      These were created before payment and are not confirmed orders. They will not move to delivery until payment is completed.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-amber-900">
                      {pendingAttempts.length} awaiting payment
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
