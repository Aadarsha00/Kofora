"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { FULFILLMENT_STATUS_LABELS } from "@/interface/admin";

function money(currency: string, value: number | string): string {
  const amount = Number(value ?? 0);
  return `${currency || "USD"} ${amount.toLocaleString(undefined, {
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

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "default" | "warning";
}) {
  const body = (
    <div
      className={`border bg-white p-5 ${
        tone === "warning" ? "border-amber-300" : "border-gray-200"
      } ${href ? "transition-colors hover:border-black" : ""}`}
    >
      <div className="flex items-center gap-2 text-gray-500">
        <Icon size={16} />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-black">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">Failed to load dashboard.</p>;
  }

  const aov = money("USD", data.revenue.average_order_value);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Store overview at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          icon={DollarSign}
          label="Paid revenue"
          value={money("USD", data.revenue.total_revenue)}
          hint={`${data.revenue.paid_orders} paid · AOV ${aov}`}
        />
        <MetricCard
          icon={Clock}
          label="Awaiting fulfillment"
          value={String(data.orders.awaiting_fulfillment)}
          hint="Paid + processing orders"
          href="/admin/orders"
          tone={data.orders.awaiting_fulfillment > 0 ? "warning" : "default"}
        />
        <MetricCard
          icon={ShoppingBag}
          label="Total orders"
          value={String(data.orders.total)}
          href="/admin/orders"
        />
        <MetricCard
          icon={Package}
          label="Products"
          value={String(data.catalog.product_count)}
          hint={`${data.catalog.published_count} published`}
          href="/admin/products"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Low stock variants"
          value={String(data.catalog.low_stock_count)}
          hint="At or below threshold"
          tone={data.catalog.low_stock_count > 0 ? "warning" : "default"}
        />
        <MetricCard icon={Users} label="Customers" value={String(data.customers.total)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-gray-600 hover:text-black">
              View all
            </Link>
          </div>
          {data.recent_orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-black">{order.order_number}</p>
                    <p className="truncate text-xs text-gray-500">{order.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">{money(order.currency, order.grand_total)}</p>
                    <p className="text-xs text-gray-500">
                      {FULFILLMENT_STATUS_LABELS[order.fulfillment_status] ?? order.fulfillment_status} ·{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">Low stock</h2>
            <Link href="/admin/products" className="text-sm font-semibold text-gray-600 hover:text-black">
              Products
            </Link>
          </div>
          {data.low_stock.length === 0 ? (
            <p className="text-sm text-gray-500">Everything is well stocked.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.low_stock.map((variant) => (
                <Link
                  key={variant.id}
                  href={`/admin/products/${variant.product_id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-black">{variant.product_name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {variant.sku} · {variant.size}/{variant.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${variant.available === 0 ? "text-red-600" : "text-amber-700"}`}>
                      {variant.available} left
                    </p>
                    <p className="text-xs text-gray-500">threshold {variant.low_stock_threshold}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
