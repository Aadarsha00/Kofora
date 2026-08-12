"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useAdminShippingMethods, useUpdateAdminShippingMethod } from "@/hooks/useAdminShipping";
import { ShippingMethod, ShippingMethodInput } from "@/interface/checkout";

type DraftState = {
  name: string;
  base_rate: string;
  ups_service_code: string;
  free_shipping_threshold: string;
  is_active: boolean;
};

function toDraft(method: ShippingMethod): DraftState {
  return {
    name: method.name,
    base_rate: method.base_rate,
    ups_service_code: method.ups_service_code,
    free_shipping_threshold: method.free_shipping_threshold ?? "",
    is_active: method.is_active,
  };
}

function money(currency: string, value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return `${currency} ${amount.toFixed(2)}`;
}

export default function AdminShippingPage() {
  const { data: methods, isLoading, isError } = useAdminShippingMethods();
  const updateMutation = useUpdateAdminShippingMethod();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [error, setError] = useState("");

  const startEdit = (method: ShippingMethod) => {
    setEditingId(method.id);
    setDraft(toDraft(method));
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setError("");
  };

  const save = async (id: number) => {
    if (!draft) return;
    setError("");

    const payload: ShippingMethodInput = {
      name: draft.name,
      base_rate: draft.base_rate,
      ups_service_code: draft.ups_service_code,
      free_shipping_threshold: draft.free_shipping_threshold.trim() ? draft.free_shipping_threshold : null,
      is_active: draft.is_active,
    };

    try {
      await updateMutation.mutateAsync({ id, payload });
      setEditingId(null);
      setDraft(null);
    } catch {
      setError("Couldn't save changes. Check the values and try again.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Shipping methods</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set the base rate and the order subtotal that qualifies for free shipping on each method. Methods with a
          UPS service code price live off UPS until the free-shipping subtotal is reached.
        </p>
      </div>

      {error && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Base rate</th>
                <th className="px-4 py-3">UPS service code</th>
                <th className="px-4 py-3">Free shipping over</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Loading shipping methods...</td></tr>
              ) : isError ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-red-600">Failed to load shipping methods.</td></tr>
              ) : !methods || methods.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No shipping methods configured.</td></tr>
              ) : (
                methods.map((method) => {
                  const isEditing = editingId === method.id && draft;
                  const isSaving = updateMutation.isPending && editingId === method.id;

                  if (isEditing && draft) {
                    return (
                      <tr key={method.id} className="border-b border-gray-100 bg-gray-50 last:border-0">
                        <td className="px-4 py-3">
                          <input
                            value={draft.name}
                            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                            className="w-full border border-gray-300 px-2 py-1.5 text-sm text-black outline-none focus:border-black"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-500">{method.code}</td>
                        <td className="px-4 py-3">
                          <input
                            value={draft.base_rate}
                            onChange={(event) => setDraft({ ...draft, base_rate: event.target.value })}
                            inputMode="decimal"
                            className="w-24 border border-gray-300 px-2 py-1.5 text-sm text-black outline-none focus:border-black"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={draft.ups_service_code}
                            onChange={(event) => setDraft({ ...draft, ups_service_code: event.target.value })}
                            placeholder="e.g. 03"
                            maxLength={3}
                            className="w-20 border border-gray-300 px-2 py-1.5 text-sm text-black outline-none focus:border-black"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={draft.free_shipping_threshold}
                            onChange={(event) => setDraft({ ...draft, free_shipping_threshold: event.target.value })}
                            placeholder="No threshold"
                            inputMode="decimal"
                            className="w-28 border border-gray-300 px-2 py-1.5 text-sm text-black outline-none focus:border-black"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                            <input
                              type="checkbox"
                              checked={draft.is_active}
                              onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })}
                            />
                            Active
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => save(method.id)}
                              disabled={isSaving}
                              title="Save"
                              className="inline-flex items-center gap-1 bg-black px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Check size={14} />
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isSaving}
                              title="Cancel"
                              className="inline-flex items-center gap-1 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={method.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-black">{method.name}</td>
                      <td className="px-4 py-3 text-gray-500">{method.code}</td>
                      <td className="px-4 py-3 text-black">{money("USD", method.base_rate)}</td>
                      <td className="px-4 py-3 text-gray-600">{method.ups_service_code || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {method.free_shipping_threshold ? money("USD", method.free_shipping_threshold) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                            method.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {method.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => startEdit(method)}
                          className="inline-flex items-center gap-1 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
