"use client";

import { FormEvent, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useCreateDiscountRule,
  useDeleteDiscountRule,
  useDiscountRules,
} from "@/hooks/useAdminDiscounts";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCategories";
import type { AdminDiscountRule, DiscountRuleRole } from "@/interface/admin";
import { getApiErrorMessage } from "@/lib/apiError";

type TargetKind = "product" | "category";

const inputClass =
  "border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black";

function ruleLabel(rule: AdminDiscountRule): string {
  if (rule.product_name) return rule.product_name;
  if (rule.category_name) return `Category: ${rule.category_name}`;
  if (rule.bundle) return `Bundle #${rule.bundle}`;
  if (rule.subscription_plan) return `Subscription plan #${rule.subscription_plan}`;
  return "Unknown target";
}

function RuleList({
  rules,
  emptyHint,
  onDelete,
  deletingId,
}: {
  rules: AdminDiscountRule[];
  emptyHint: string;
  onDelete: (id: number) => void;
  deletingId: number | null;
}) {
  if (rules.length === 0) {
    return <p className="border border-dashed border-gray-300 p-3 text-sm text-gray-500">{emptyHint}</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 border border-gray-200">
      {rules.map((rule) => (
        <li key={rule.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
          <span className="text-sm text-black">{ruleLabel(rule)}</span>
          <button
            type="button"
            onClick={() => onDelete(rule.id)}
            disabled={deletingId === rule.id}
            aria-label={`Remove ${ruleLabel(rule)}`}
            className="text-gray-400 transition-colors hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 size={15} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Scope editor for a discount.
 *
 * A discount with no rules applies to the whole cart. Adding "eligible" rules
 * narrows what counts toward the buy quantity; adding "reward" rules turns the
 * offer into a cross-sell ("buy 3 socks, get a cap free") by drawing the free
 * item from a different set than the one being bought.
 */
export default function DiscountRuleManager({
  discountId,
  isBogo,
}: {
  discountId: number;
  isBogo: boolean;
}) {
  const { data: rules, isLoading } = useDiscountRules(discountId);
  const { data: productPage } = useAdminProducts({ page_size: 200, ordering: "name" });
  const { data: categories } = useCategories();
  const createRule = useCreateDiscountRule(discountId);
  const deleteRule = useDeleteDiscountRule(discountId);

  const [role, setRole] = useState<DiscountRuleRole>("eligible");
  const [targetKind, setTargetKind] = useState<TargetKind>("product");
  const [targetId, setTargetId] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const products = productPage?.results ?? [];
  const categoryList = categories ?? [];

  const eligibleRules = useMemo(
    () => (rules ?? []).filter((rule) => rule.role === "eligible"),
    [rules]
  );
  const rewardRules = useMemo(
    () => (rules ?? []).filter((rule) => rule.role === "reward"),
    [rules]
  );

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!targetId) {
      setError(`Pick a ${targetKind} to add.`);
      return;
    }

    createRule.mutate(
      {
        discount: discountId,
        role,
        product: targetKind === "product" ? Number(targetId) : null,
        category: targetKind === "category" ? Number(targetId) : null,
      },
      {
        onSuccess: () => setTargetId(""),
        onError: (err) => setError(getApiErrorMessage(err, "Failed to add rule.")),
      }
    );
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteRule.mutate(id, {
      onError: (err) => setError(getApiErrorMessage(err, "Failed to remove rule.")),
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-bold text-black">Scope</h2>
      <p className="mb-4 text-sm text-gray-500">
        {eligibleRules.length === 0
          ? "No rules yet — this discount applies to everything in the cart."
          : "This discount only applies to the products and categories listed below."}
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading rules...</p>
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-black">
              {isBogo ? "Counts towards the buy quantity" : "Applies to"}
            </h3>
            <RuleList
              rules={eligibleRules}
              emptyHint="Everything in the cart qualifies."
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </div>

          {isBogo && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-black">Can be given as the reward</h3>
              <RuleList
                rules={rewardRules}
                emptyHint="The free item is taken from what they bought. Add products here for a cross-sell like 'buy 3 socks, get a cap free'."
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleAdd} className="mt-5 border-t border-gray-200 pt-5">
        <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr_auto]">
          {isBogo && (
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold text-black">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as DiscountRuleRole)}
                className={inputClass}
              >
                <option value="eligible">Must buy</option>
                <option value="reward">Reward</option>
              </select>
            </label>
          )}

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">Target</span>
            <select
              value={targetKind}
              onChange={(event) => {
                setTargetKind(event.target.value as TargetKind);
                setTargetId("");
              }}
              className={inputClass}
            >
              <option value="product">Product</option>
              <option value="category">Category</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">
              {targetKind === "product" ? "Product" : "Category"}
            </span>
            <select
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className={inputClass}
            >
              <option value="">Select...</option>
              {targetKind === "product"
                ? products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))
                : categoryList.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={createRule.isPending}
            className="self-end bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {createRule.isPending ? "Adding..." : "Add rule"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      </form>
    </section>
  );
}
