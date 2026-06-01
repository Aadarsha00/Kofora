"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAdminOrder, useUpdateAdminOrderStatus } from "@/hooks/useAdminOrders";
import {
  AdminOrderAddressSnapshot,
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUSES,
  FulfillmentStatus,
} from "@/interface/admin";

function money(currency: string, value: string | number): string {
  const amount = Number(value ?? 0);
  return `${currency || "USD"} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function AddressCard({ address }: { address: AdminOrderAddressSnapshot }) {
  return (
    <div className="border border-gray-200 p-4 text-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{address.address_type}</p>
      <p className="font-semibold text-black">{address.full_name}</p>
      <p className="text-gray-600">
        {address.address_line_1}
        {address.address_line_2 ? `, ${address.address_line_2}` : ""}
      </p>
      <p className="text-gray-600">
        {address.city}, {address.state_province} {address.postal_code}, {address.country}
      </p>
      <p className="mt-1 text-gray-500">{address.phone}</p>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { data: order, isLoading, isError } = useAdminOrder(Number.isFinite(orderId) ? orderId : undefined);
  const updateStatus = useUpdateAdminOrderStatus(orderId);

  const [status, setStatus] = useState<FulfillmentStatus | "">("");
  const [note, setNote] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const nextStatus = (status || order?.fulfillment_status) as FulfillmentStatus;
    if (!nextStatus) {
      setError("Select a status.");
      return;
    }

    updateStatus.mutate(
      {
        fulfillment_status: nextStatus,
        note: note.trim() || undefined,
        staff_notes: staffNotes.trim() ? staffNotes : undefined,
      },
      {
        onSuccess: () => {
          setMessage("Order updated.");
          setNote("");
          setStatus("");
        },
        onError: (err) => setError(getErrorMessage(err, "Failed to update order.")),
      }
    );
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading order...</p>;
  }

  if (isError || !order) {
    return (
      <div>
        <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
          <ArrowLeft size={16} />
          Back to orders
        </Link>
        <p className="text-sm text-red-600">Order not found.</p>
      </div>
    );
  }

  const customerName = `${order.customer.first_name} ${order.customer.last_name}`.trim() || order.customer.email;
  const currentStatusValue = status || order.fulfillment_status;
  const staffNotesValue = staffNotes || order.staff_notes;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-3 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">{order.order_number}</h1>
          <p className="mt-1 text-sm text-gray-500">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold capitalize text-black">{order.payment_status}</span> payment ·{" "}
          <span className="font-semibold text-black">
            {FULFILLMENT_STATUS_LABELS[order.fulfillment_status] ?? order.fulfillment_status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold text-black">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-gray-100 pb-3 text-sm last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-black">{item.product_name}</p>
                    <p className="mt-1 text-gray-500">
                      {item.color} / {item.size} · SKU {item.variant_sku} · x{item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-black">{money(order.currency, item.line_total)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-black">{money(order.currency, order.subtotal)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-{money(order.currency, order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-black">{money(order.currency, order.shipping_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="text-black">{money(order.currency, order.tax_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-black">
                <span>Total</span>
                <span>{money(order.currency, order.grand_total)}</span>
              </div>
            </div>
          </section>

          {order.address_snapshots.length > 0 && (
            <section className="border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-bold text-black">Addresses</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {order.address_snapshots.map((address) => (
                  <AddressCard key={address.id} address={address} />
                ))}
              </div>
            </section>
          )}

          {order.customer_notes && (
            <section className="border border-gray-200 bg-white p-5">
              <h2 className="mb-2 text-lg font-bold text-black">Customer notes</h2>
              <p className="text-sm text-gray-600">{order.customer_notes}</p>
            </section>
          )}

          <section className="border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold text-black">Status history</h2>
            {order.status_history.length === 0 ? (
              <p className="text-sm text-gray-500">No status changes recorded.</p>
            ) : (
              <ol className="space-y-3">
                {order.status_history.map((entry) => (
                  <li key={entry.id} className="flex gap-3 text-sm">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-black" />
                    <div>
                      <p className="font-semibold text-black">
                        {FULFILLMENT_STATUS_LABELS[entry.to_status] ?? entry.to_status}
                        {entry.from_status && (
                          <span className="font-normal text-gray-400">
                            {" "}
                            (from {FULFILLMENT_STATUS_LABELS[entry.from_status] ?? entry.from_status})
                          </span>
                        )}
                      </p>
                      {entry.note && <p className="text-gray-500">{entry.note}</p>}
                      <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-black">Customer</h2>
            <p className="text-sm font-semibold text-black">{customerName}</p>
            <p className="text-sm text-gray-600">{order.customer.email}</p>
            {order.customer.phone && <p className="text-sm text-gray-500">{order.customer.phone}</p>}
          </section>

          <section className="border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold text-black">Update status</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-black">Fulfillment status</span>
                <select
                  value={currentStatusValue}
                  onChange={(event) => setStatus(event.target.value as FulfillmentStatus)}
                  className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                >
                  {FULFILLMENT_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {FULFILLMENT_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-black">Note (optional)</span>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. Shipped via DHL #123"
                  className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-black">Staff notes</span>
                <textarea
                  value={staffNotesValue}
                  onChange={(event) => setStaffNotes(event.target.value)}
                  rows={3}
                  className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                />
              </label>

              <button
                type="submit"
                disabled={updateStatus.isPending}
                className="bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {updateStatus.isPending ? "Saving..." : "Save changes"}
              </button>
              {message && <p className="text-sm font-semibold text-green-700">{message}</p>}
              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
