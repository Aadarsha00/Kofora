"use client";

import { FormEvent, useState } from "react";
import { Trash2 } from "lucide-react";
import { useDeleteCoupon, useDiscountCoupons, useSaveCoupon } from "@/hooks/useAdminDiscounts";
import { getApiErrorMessage } from "@/lib/apiError";

export default function CouponManager({
  discountId,
  firstOrderOnly,
}: {
  discountId: number;
  firstOrderOnly: boolean;
}) {
  const { data: coupons, isLoading } = useDiscountCoupons(firstOrderOnly ? undefined : discountId);
  const saveCoupon = useSaveCoupon(discountId);
  const deleteCoupon = useDeleteCoupon(discountId);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Enter a code.");
      return;
    }
    saveCoupon.mutate(
      { payload: { discount: discountId, code: code.trim(), is_active: true } },
      {
        onSuccess: () => setCode(""),
        onError: (err) => setError(getApiErrorMessage(err, "Failed to add coupon.")),
      }
    );
  };

  const toggle = (id: number, currentCode: string, isActive: boolean) => {
    saveCoupon.mutate({ id, payload: { discount: discountId, code: currentCode, is_active: !isActive } });
  };

  if (firstOrderOnly) {
    return (
      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-bold text-black">Coupon codes</h2>
        <p className="border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          This is a first-order discount — customers claim it by email at checkout, so it has no manual coupon codes.
        </p>
      </section>
    );
  }

  const list = coupons ?? [];

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-bold text-black">Coupon codes</h2>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading codes...</p>
      ) : list.length === 0 ? (
        <p className="mb-4 border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No codes yet. Add one below so shoppers can apply this discount at checkout.
        </p>
      ) : (
        <div className="mb-4 divide-y divide-gray-100">
          {list.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="font-mono font-semibold text-black">{coupon.code}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(coupon.id, coupon.code, coupon.is_active)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    coupon.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {coupon.is_active ? "Active" : "Inactive"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete code ${coupon.code}?`)) deleteCoupon.mutate(coupon.id);
                  }}
                  className="inline-flex items-center gap-1 border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 border-t border-gray-200 pt-4">
        <label className="grid flex-1 gap-1.5 text-sm">
          <span className="font-semibold text-gray-600">New code</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="SUMMER10"
            className="border border-gray-300 px-3 py-2.5 text-sm font-mono text-black outline-none focus:border-black"
          />
        </label>
        <button
          type="submit"
          disabled={saveCoupon.isPending}
          className="bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add code
        </button>
      </form>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </section>
  );
}
