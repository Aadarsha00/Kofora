"use client";

import { FormEvent, ReactNode, useState } from "react";
import { AdminDiscountInput, DiscountType, RewardSource } from "@/interface/admin";

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function localInputToIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

interface FormState {
  name: string;
  discount_type: DiscountType;
  flat_amount: string;
  percentage: string;
  usage_limit: string;
  per_user_limit: string;
  starts_at: string;
  expires_at: string;
  minimum_order_amount: string;
  first_order_only: boolean;
  is_auto_applied: boolean;
  is_stackable: boolean;
  is_active: boolean;
  buy_quantity: string;
  get_quantity: string;
  reward_percentage: string;
  max_applications: string;
  reward_source: RewardSource;
}

function toForm(initial: AdminDiscountInput): FormState {
  return {
    name: initial.name,
    discount_type: initial.discount_type,
    flat_amount: initial.flat_amount ?? "",
    percentage: initial.percentage ?? "",
    usage_limit: initial.usage_limit != null ? String(initial.usage_limit) : "",
    per_user_limit: initial.per_user_limit != null ? String(initial.per_user_limit) : "",
    starts_at: isoToLocalInput(initial.starts_at),
    expires_at: isoToLocalInput(initial.expires_at),
    minimum_order_amount: initial.minimum_order_amount ?? "0",
    first_order_only: initial.first_order_only,
    is_auto_applied: initial.is_auto_applied,
    is_stackable: initial.is_stackable,
    is_active: initial.is_active,
    buy_quantity: initial.buy_quantity != null ? String(initial.buy_quantity) : "",
    get_quantity: initial.get_quantity != null ? String(initial.get_quantity) : "",
    reward_percentage: initial.reward_percentage ?? "100",
    max_applications: initial.max_applications != null ? String(initial.max_applications) : "",
    reward_source: initial.reward_source ?? "cheapest",
  };
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold text-black">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

const inputClass = "border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black";

export default function DiscountForm({
  mode,
  initial,
  submitting,
  error,
  message,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial: AdminDiscountInput;
  submitting: boolean;
  error: string;
  message?: string;
  onSubmit: (values: AdminDiscountInput) => void;
}) {
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [localError, setLocalError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLocalError("");

    if (!form.name.trim()) {
      setLocalError("Name is required.");
      return;
    }
    if (form.discount_type === "flat" && !form.flat_amount.trim()) {
      setLocalError("Flat discounts need an amount.");
      return;
    }
    if (form.discount_type === "percent" && !form.percentage.trim()) {
      setLocalError("Percent discounts need a percentage.");
      return;
    }
    if (form.discount_type === "bogo") {
      const buy = Number(form.buy_quantity);
      const get = Number(form.get_quantity);
      if (!Number.isInteger(buy) || buy < 1) {
        setLocalError("Buy quantity must be a whole number of 1 or more.");
        return;
      }
      if (!Number.isInteger(get) || get < 1) {
        setLocalError("Get quantity must be a whole number of 1 or more.");
        return;
      }
      const reward = Number(form.reward_percentage);
      if (!(reward > 0 && reward <= 100)) {
        setLocalError("Reward percentage must be between 1 and 100.");
        return;
      }
    }

    onSubmit({
      name: form.name.trim(),
      discount_type: form.discount_type,
      flat_amount: form.discount_type === "flat" ? form.flat_amount.trim() || null : null,
      percentage: form.discount_type === "percent" ? form.percentage.trim() || null : null,
      usage_limit: form.usage_limit.trim() ? Number(form.usage_limit) : null,
      per_user_limit: form.per_user_limit.trim() ? Number(form.per_user_limit) : null,
      starts_at: localInputToIso(form.starts_at),
      expires_at: localInputToIso(form.expires_at),
      minimum_order_amount: form.minimum_order_amount.trim() || "0",
      first_order_only: form.first_order_only,
      is_auto_applied: form.is_auto_applied,
      is_stackable: form.is_stackable,
      is_active: form.is_active,
      buy_quantity: form.discount_type === "bogo" ? Number(form.buy_quantity) : null,
      get_quantity: form.discount_type === "bogo" ? Number(form.get_quantity) : null,
      reward_percentage: form.discount_type === "bogo" ? form.reward_percentage.trim() || "100" : "100",
      max_applications:
        form.discount_type === "bogo" && form.max_applications.trim()
          ? Number(form.max_applications)
          : null,
      reward_source: form.reward_source,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">Discount</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input value={form.name} onChange={(event) => set("name", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Type">
            <select
              value={form.discount_type}
              onChange={(event) => set("discount_type", event.target.value as DiscountType)}
              className={inputClass}
            >
              <option value="flat">Flat amount</option>
              <option value="percent">Percentage</option>
              <option value="bogo">Buy X get Y</option>
            </select>
          </Field>
          {form.discount_type === "flat" && (
            <Field label="Flat amount" hint="e.g. 10.00">
              <input value={form.flat_amount} onChange={(event) => set("flat_amount", event.target.value)} className={inputClass} />
            </Field>
          )}
          {form.discount_type === "percent" && (
            <Field label="Percentage" hint="e.g. 15 for 15%">
              <input value={form.percentage} onChange={(event) => set("percentage", event.target.value)} className={inputClass} />
            </Field>
          )}
          <Field label="Minimum order amount" hint="0 for no minimum">
            <input
              value={form.minimum_order_amount}
              onChange={(event) => set("minimum_order_amount", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {form.discount_type === "bogo" && (
        <section className="border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-lg font-bold text-black">Buy X get Y</h2>
          <p className="mb-4 text-sm text-gray-500">
            Buy {form.buy_quantity || "X"}, get {form.get_quantity || "Y"} at{" "}
            {form.reward_percentage || "100"}% off. The cheapest qualifying items are always the
            discounted ones.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Buy quantity" hint="Items the shopper must buy, e.g. 2">
              <input
                value={form.buy_quantity}
                onChange={(event) => set("buy_quantity", event.target.value)}
                className={inputClass}
                inputMode="numeric"
              />
            </Field>
            <Field label="Get quantity" hint="Items they get discounted, e.g. 1">
              <input
                value={form.get_quantity}
                onChange={(event) => set("get_quantity", event.target.value)}
                className={inputClass}
                inputMode="numeric"
              />
            </Field>
            <Field label="Reward percentage" hint="100 = free, 50 = half price">
              <input
                value={form.reward_percentage}
                onChange={(event) => set("reward_percentage", event.target.value)}
                className={inputClass}
                inputMode="numeric"
              />
            </Field>
            <Field label="Max applications per cart" hint="Blank = repeats as often as the cart allows">
              <input
                value={form.max_applications}
                onChange={(event) => set("max_applications", event.target.value)}
                className={inputClass}
                inputMode="numeric"
              />
            </Field>
            <Field
              label="Reward comes from"
              hint="Use a separate reward set for offers like 'buy 3 socks, get a cap free'"
            >
              <select
                value={form.reward_source}
                onChange={(event) => set("reward_source", event.target.value as RewardSource)}
                className={inputClass}
              >
                <option value="cheapest">The same items they bought</option>
                <option value="reward_set">A separate reward product set</option>
              </select>
            </Field>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Leave this discount auto-applied so it fires without a code. Scope it to specific
            products or categories from the discount rules; with no rules it applies to the whole
            cart.
          </p>
        </section>
      )}

      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">Limits & schedule</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Total usage limit" hint="Blank = unlimited">
            <input value={form.usage_limit} onChange={(event) => set("usage_limit", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Per-user limit" hint="Blank = unlimited">
            <input value={form.per_user_limit} onChange={(event) => set("per_user_limit", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Starts at" hint="Blank = immediately">
            <input type="datetime-local" value={form.starts_at} onChange={(event) => set("starts_at", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Expires at" hint="Blank = never">
            <input type="datetime-local" value={form.expires_at} onChange={(event) => set("expires_at", event.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">Options</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_auto_applied} onChange={(event) => set("is_auto_applied", event.target.checked)} />
            Auto-applied (no code needed)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_stackable} onChange={(event) => set("is_stackable", event.target.checked)} />
            Stackable with other discounts
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.first_order_only} onChange={(event) => set("first_order_only", event.target.checked)} />
            First order only (email-claimed)
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create discount" : "Save changes"}
        </button>
        {message && <span className="text-sm font-semibold text-green-700">{message}</span>}
        {(localError || error) && <span className="text-sm font-semibold text-red-600">{localError || error}</span>}
      </div>
    </form>
  );
}
