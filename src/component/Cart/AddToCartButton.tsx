/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useState } from "react";
import { HandbagIcon } from "@phosphor-icons/react";

interface AddToCartButtonProps {
  variantId: number;
  productName: string;
  price?: string;
  availableQuantity?: number;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export default function AddToCartButton({
  variantId,
  productName,
  price = "0",
  availableQuantity,
  disabled = false,
  className = "",
  onSuccess,
}: AddToCartButtonProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { mutate: addToCart, isPending: apiPending } = useAddToCart();
  const addGuestItem = useGuestCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);

  const handleAddToCart = () => {
    const existingGuestQuantity =
      useGuestCartStore.getState().items.find((item) => item.variantId === variantId)?.quantity ?? 0;
    if (availableQuantity !== undefined && quantity + (!isAuthenticated ? existingGuestQuantity : 0) > availableQuantity) {
      alert(`Only ${availableQuantity} item${availableQuantity === 1 ? "" : "s"} available.`);
      return;
    }

    if (isAuthenticated) {
      // Authenticated user: use backend API
      addToCart(
        { variantId, quantity },
        {
          onSuccess: () => {
            setQuantity(1);
            setShowQuantityPicker(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            console.error("[AddToCart] Error:", error);
            alert(error?.message || "Failed to add item to cart");
          },
        }
      );
    } else {
      // Guest user: use local storage cart
      addGuestItem(variantId, productName, quantity, price, availableQuantity);
      setQuantity(1);
      setShowQuantityPicker(false);
      onSuccess?.();
    }
  };

  if (showQuantityPicker) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            -
          </button>
          <span className="px-4 py-2 font-semibold text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((current) => Math.min(current + 1, availableQuantity ?? current + 1))}
            disabled={availableQuantity !== undefined && quantity >= availableQuantity}
            className="px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={authLoading || apiPending || disabled}
          className="flex-1 h-11 bg-black text-white px-6 rounded-md text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <HandbagIcon size={20} />
          {authLoading || apiPending ? "Adding..." : "Add to Cart"}
        </button>

        <button
          onClick={() => {
            setShowQuantityPicker(false);
            setQuantity(1);
          }}
          className="h-11 px-6 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowQuantityPicker(true)}
      disabled={authLoading || apiPending || disabled}
      className={`h-11 bg-black text-white px-6 rounded-md text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      <HandbagIcon size={20} />
      {authLoading || apiPending ? "Adding to Cart..." : "Add to Cart"}
    </button>
  );
}
