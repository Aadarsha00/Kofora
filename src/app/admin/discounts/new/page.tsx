"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import DiscountForm from "@/component/admin/DiscountForm";
import { useCreateAdminDiscount } from "@/hooks/useAdminDiscounts";
import { AdminDiscountInput } from "@/interface/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const EMPTY_DISCOUNT: AdminDiscountInput = {
  name: "",
  discount_type: "percent",
  flat_amount: null,
  percentage: null,
  usage_limit: null,
  per_user_limit: null,
  starts_at: null,
  expires_at: null,
  minimum_order_amount: "0",
  first_order_only: false,
  is_auto_applied: false,
  is_stackable: false,
  is_active: true,
};

export default function NewDiscountPage() {
  const router = useRouter();
  const createDiscount = useCreateAdminDiscount();
  const [error, setError] = useState("");

  const handleSubmit = (values: AdminDiscountInput) => {
    setError("");
    createDiscount.mutate(values, {
      onSuccess: (discount) => router.push(`/admin/discounts/${discount.id}`),
      onError: (err) => setError(getApiErrorMessage(err, "Failed to create discount.")),
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/discounts" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black">
        <ArrowLeft size={16} />
        Back to discounts
      </Link>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-black">New discount</h1>
        <p className="mt-1 text-sm text-gray-500">Create the discount, then add coupon codes on the next screen.</p>
      </div>

      <DiscountForm mode="create" initial={EMPTY_DISCOUNT} submitting={createDiscount.isPending} error={error} onSubmit={handleSubmit} />
    </div>
  );
}
