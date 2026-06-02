"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { FULFILLMENT_STATUS_LABELS } from "@/interface/admin";

const STATUS_COLORS: Record<string, string> = {
  pending: "#6b7280",
  awaiting_payment: "#d97706",
  paid: "#2563eb",
  processing: "#7c3aed",
  shipped: "#0891b2",
  delivered: "#15803d",
  cancelled: "#dc2626",
  partially_refunded: "#b45309",
  refunded: "#be123c",
  returned: "#475569",
};

const INVENTORY_COLORS = {
  healthy: "#15803d",
  low: "#d97706",
  out: "#dc2626",
};

function money(currency: string, value: number | string): string {
  const amount = Number(value ?? 0);
  return `${currency || "USD"} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function compactMoney(value: number | string): string {
  const amount = Number(value ?? 0);
  if (amount >= 1000) return `$${Math.round(amount / 1000)}k`;
  return `$${amount}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function fullDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function percent(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-200"
      : tone === "warning"
        ? "border-amber-200"
        : "border-gray-200";

  const body = (
    <div className={`border bg-white p-5 ${toneClass} ${href ? "transition-colors hover:border-black" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-500">
          <Icon size={16} />
          <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        </div>
        {href && <ArrowUpRight size={15} className="text-gray-400" />}
      </div>
      <p className="mt-4 text-2xl font-bold text-black">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-gray-200 bg-white p-5 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-black">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = FULFILLMENT_STATUS_LABELS[status] ?? status;
  const good = ["paid", "processing", "shipped", "delivered"].includes(status);
  const bad = ["cancelled", "refunded", "returned", "partially_refunded"].includes(status);
  const className = good
    ? "bg-green-100 text-green-800"
    : bad
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>;
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
  const revenueTrend = data.revenue.trend.map((point) => ({
    ...point,
    revenue: Number(point.revenue),
    label: formatDate(point.date),
  }));
  const statusData = data.orders.status_breakdown.filter((status) => status.count > 0);
  const inventoryHealthData = [
    { name: "Healthy", value: data.catalog.inventory_health.healthy, fill: INVENTORY_COLORS.healthy },
    { name: "Low", value: data.catalog.inventory_health.low, fill: INVENTORY_COLORS.low },
    { name: "Out", value: data.catalog.inventory_health.out, fill: INVENTORY_COLORS.out },
  ];
  const totalInventory = inventoryHealthData.reduce((sum, item) => sum + item.value, 0);
  const customerVerifiedPct = percent(data.customers.verified, data.customers.total);
  const marketingPct = percent(data.customers.marketing_opt_in, data.customers.total);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Revenue, order flow, inventory risk, and customer health.</p>
        </div>
        <div className="text-sm text-gray-500">Trend: last 14 days</div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          icon={DollarSign}
          label="Paid revenue"
          value={money("USD", data.revenue.total_revenue)}
          hint={`${data.revenue.paid_orders} paid orders - AOV ${aov}`}
        />
        <MetricCard
          icon={Clock}
          label="Awaiting fulfillment"
          value={String(data.orders.awaiting_fulfillment)}
          hint="Paid or processing orders"
          href="/admin/orders"
          tone={data.orders.awaiting_fulfillment > 0 ? "warning" : "default"}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Stock risk"
          value={String(data.catalog.low_stock_count)}
          hint={`${data.catalog.inventory_health.out} out of stock`}
          href="/admin/inventory?stock_status=low"
          tone={data.catalog.inventory_health.out > 0 ? "danger" : data.catalog.low_stock_count > 0 ? "warning" : "default"}
        />
        <MetricCard
          icon={Users}
          label="Customers"
          value={String(data.customers.total)}
          hint={`${data.customers.active} active - ${customerVerifiedPct} verified`}
          href="/admin/customers"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <Panel title="Revenue and Orders" subtitle="Paid order activity by day" className="min-h-[360px]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueTrend} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis
                  yAxisId="revenue"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={compactMoney}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue" ? [money("USD", value as number | string), "Revenue"] : [value, "Orders"]
                  }
                  labelFormatter={(_, payload) => {
                    const point = payload?.[0]?.payload;
                    return point?.date ? fullDate(point.date) : "";
                  }}
                  contentStyle={{ borderColor: "#d1d5db", borderRadius: 0, fontSize: 12 }}
                />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={2}
                  fill="#e5e7eb"
                  activeDot={{ r: 4 }}
                />
                <Bar yAxisId="orders" dataKey="orders" fill="#0f766e" barSize={16} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Fulfillment Mix" subtitle={`${data.orders.total} total orders`} className="min-h-[360px]">
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#6b7280"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      contentStyle={{ borderColor: "#d1d5db", borderRadius: 0, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {statusData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[item.status] ?? "#6b7280" }}
                      />
                      <span className="truncate text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-semibold text-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Inventory Health" subtitle={`${totalInventory} active variants`}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inventoryHealthData}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              >
                <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#374151", fontSize: 12 }}
                  width={62}
                />
                <Tooltip
                  formatter={(value, name, item) => [value, item.payload.name]}
                  contentStyle={{ borderColor: "#d1d5db", borderRadius: 0, fontSize: 12 }}
                />
                <Bar dataKey="value" radius={0}>
                  {inventoryHealthData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Customer Signals" subtitle={`${data.customers.active} active accounts`}>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Verified email</span>
                <span className="font-bold text-black">{customerVerifiedPct}</span>
              </div>
              <div className="h-2 bg-gray-100">
                <div className="h-2 bg-green-700" style={{ width: customerVerifiedPct }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{data.customers.verified} verified customers</p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Marketing opt-in</span>
                <span className="font-bold text-black">{marketingPct}</span>
              </div>
              <div className="h-2 bg-gray-100">
                <div className="h-2 bg-amber-600" style={{ width: marketingPct }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{data.customers.marketing_opt_in} reachable for campaigns</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="border border-gray-200 p-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Inactive</p>
                <p className="mt-2 text-xl font-bold text-black">{data.customers.inactive}</p>
              </div>
              <div className="border border-gray-200 p-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Paid orders</p>
                <p className="mt-2 text-xl font-bold text-black">{data.revenue.paid_orders}</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Catalog"
          subtitle={`${data.catalog.published_count} published products`}
          action={
            <Link href="/admin/products" className="text-sm font-semibold text-gray-600 hover:text-black">
              Products
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Package size={16} />
                <span className="text-xs font-semibold uppercase">Products</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-black">{data.catalog.product_count}</p>
            </div>
            <div className="border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <ShoppingBag size={16} />
                <span className="text-xs font-semibold uppercase">Orders</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-black">{data.orders.total}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Published products</span>
              <span className="font-semibold text-black">{data.catalog.published_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Low stock variants</span>
              <span className="font-semibold text-amber-700">{data.catalog.low_stock_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Out of stock variants</span>
              <span className="font-semibold text-red-700">{data.catalog.inventory_health.out}</span>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          title="Recent Orders"
          action={
            <Link href="/admin/orders" className="text-sm font-semibold text-gray-600 hover:text-black">
              View all
            </Link>
          }
        >
          {data.recent_orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 text-sm hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-black">{order.order_number}</p>
                    <p className="truncate text-xs text-gray-500">{order.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">{money(order.currency, order.grand_total)}</p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={order.fulfillment_status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Low Stock"
          action={
            <Link href="/admin/inventory?stock_status=low" className="text-sm font-semibold text-gray-600 hover:text-black">
              Inventory
            </Link>
          }
        >
          {data.low_stock.length === 0 ? (
            <p className="text-sm text-gray-500">Everything is well stocked.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.low_stock.map((variant) => {
                const threshold = Math.max(variant.low_stock_threshold, 1);
                const stockPct = `${Math.min(100, Math.max(0, (variant.available / threshold) * 100))}%`;
                return (
                  <Link
                    key={variant.id}
                    href={`/admin/products/${variant.product_id}`}
                    className="grid grid-cols-[minmax(0,1fr)_80px] gap-3 py-3 text-sm hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-black">{variant.product_name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {variant.sku} - {variant.size}/{variant.color}
                      </p>
                      <div className="mt-2 h-1.5 bg-gray-100">
                        <div
                          className={variant.available === 0 ? "h-1.5 bg-red-600" : "h-1.5 bg-amber-600"}
                          style={{ width: stockPct }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${variant.available === 0 ? "text-red-700" : "text-amber-700"}`}>
                        {variant.available}
                      </p>
                      <p className="text-xs text-gray-500">of {variant.low_stock_threshold}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
