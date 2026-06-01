"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import DiscountForm from "@/component/admin/DiscountForm";
import CouponManager from "@/component/admin/CouponManager";
import {
  useAdminDiscount,
  useDeleteAdminDiscount,
  useUpdateAdminDiscount,
} from "@/hooks/useAdminDiscounts";
import { AdminDiscountInput } from "@/interface/admin";
import { getApiErrorMessage } from "@/lib/apiError";

export default function EditDiscountPage() {
  const params = useParams<{ id: string }>();
  const discountId = Number(params.id);
  const router = useRouter();
  const { data: discount, isLoading, isError } = useAdminDiscount(
    Number.isFinite(discountId) ? discountId : undefined
  );
  const updateDiscount = useUpdateAdminDiscount(discountId);
  const deleteDiscount = useDeleteAdminDiscount();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (values: AdminDiscountInput) => {
    setMessage("");
    setError("");
    updateDiscount.mutate(values, {
      onSuccess: () => setMessage("Saved."),
      onError: (err) => setError(getApiErrorMessage(err, "Failed to save discount.")),
    });
  };

  const handleDelete = () => {
    if (!discount) return;
    if (!window.confirm(`Delete "${discount.name}"? This cannot be undone.`)) return;
    deleteDiscount.mutate(discountId, {
      onSuccess: () => router.push("/admin/discounts"),
      onError: (err) => setError(getApiErrorMessage(err, "Failed to delete discount.")),
    });
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading discount...</p>;
  }

  if (isError || !discount) {
    return (
      <div>
        <Link href="/admin/discounts" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
          <ArrowLeft size={16} />
          Back to discounts
        </Link>
        <p className="text-sm text-red-600">Discount not found.</p>
      </div>
    );
  }

  const initial: AdminDiscountInput = {
    name: discount.name,
    discount_type: discount.discount_type,
    flat_amount: discount.flat_amount,
    percentage: discount.percentage,
    usage_limit: discount.usage_limit,
    per_user_limit: discount.per_user_limit,
    starts_at: discount.starts_at,
    expires_at: discount.expires_at,
    minimum_order_amount: discount.minimum_order_amount,
    first_order_only: discount.first_order_only,
    is_auto_applied: discount.is_auto_applied,
    is_stackable: discount.is_stackable,
    is_active: discount.is_active,
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/discounts" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
        <ArrowLeft size={16} />
        Back to discounts
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-3 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">
        <h1 className="text-2xl font-bold text-black">{discount.name}</h1>
        <button
          onClick={handleDelete}
          disabled={deleteDiscount.isPending}
          className="inline-flex items-center gap-2 self-start border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 sm:self-auto"
        >
          <Trash2 size={15} />
          Delete discount
        </button>
      </div>

      <div className="space-y-6">
        <DiscountForm
          key={discount.id}
          mode="edit"
          initial={initial}
          submitting={updateDiscount.isPending}
          error={error}
          message={message}
          onSubmit={handleSubmit}
        />
        <CouponManager discountId={discountId} firstOrderOnly={discount.first_order_only} />
      </div>
    </div>
  );
}
