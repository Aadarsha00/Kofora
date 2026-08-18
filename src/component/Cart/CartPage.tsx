"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, X } from "lucide-react";
import { TicketIcon } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useCart, useRemoveFromCart, useUpdateCartItem, useCartTotals, useApplyCoupon, useRemoveCoupon } from "@/hooks/useCart";
import { useValidateCoupon } from "@/hooks/useDiscounts";
import { useGuestDiscount } from "@/hooks/useGuestDiscount";
import { useGuestCartCalculations } from "@/hooks/useGuestCartCalculations";
import { getProductVariantsByIds } from "@/api/products.api";

// Hex to Color Name mapping
const hexToColorName: Record<string, string> = {
  "#ffffff": "White",
  "#000000": "Black",
  "#ff0000": "Red",
  "#00ff00": "Green",
  "#0000ff": "Blue",
  "#ffff00": "Yellow",
  "#ffc0cb": "Pink",
  "#a52a2a": "Brown",
  "#808080": "Gray",
  "#ffa500": "Orange",
  "#800080": "Purple",
  "#ffb6c1": "Light Pink",
  "#deb887": "Tan",
  "#d2b48c": "Khaki",
  "#cccccc": "Light Gray",
};

function getColorName(hex: string): string {
  if (!hex) return "";
  const normalized = hex.toLowerCase();
  return hexToColorName[normalized] || hex;
}

function formatVariantDetails(color: string, size: string): string {
  return [getColorName(color), size].filter(Boolean).join(" / ");
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type GuestCartItem = {
  variantId: number;
  productName: string;
  quantity: number;
  price: string;
};

type VariantDisplayData = {
  price?: string;
  image?: string;
  size?: string;
  color?: string;
  productName?: string;
};

type AuthVariant = {
  id: number;
  product_name?: string;
  title?: string;
  price?: string;
  color?: string;
  size?: string;
  image?: string | null;
  image_override?: string | null;
  image_alt_text?: string | null;
};

type AuthVariantCartItem = {
  id: number;
  quantity: number;
  variant: AuthVariant;
};

type AuthBundleCartItem = {
  id: number;
  quantity: number;
  bundle?: {
    name?: string;
    price?: string;
  };
};

type DisplayCartItem = GuestCartItem | AuthVariantCartItem | AuthBundleCartItem;

function isGuestCartItem(item: DisplayCartItem): item is GuestCartItem {
  return "variantId" in item;
}

function isVariantCartItem(item: DisplayCartItem): item is AuthVariantCartItem {
  return "variant" in item;
}

export default function CartPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [variantData, setVariantData] = useState<Record<number, VariantDisplayData>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { getGuestDiscount, clearGuestDiscount } = useGuestDiscount();
  
  const { data: authenticatedCart, isLoading: cartLoading } = useCart();
  const { mutate: removeItem } = useRemoveFromCart();
  const { mutate: updateQuantity } = useUpdateCartItem();
  const totals = useCartTotals();
  const guestItems = useGuestCartStore((state) => state.items);
  const removeGuestItem = useGuestCartStore((state) => state.removeItem);
  const updateGuestItem = useGuestCartStore((state) => state.updateItem);
  
  const { mutate: validateCoupon, isPending: validatingCoupon } = useValidateCoupon();
  const { mutate: applyCoupon, isPending: applyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon } = useRemoveCoupon();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!isAuthenticated) {
      setCouponError("Please log in to apply coupons");
      return;
    }

    const subtotal = totals?.subtotal || 0;

    validateCoupon(
      { code: couponCode.trim(), subtotal },
      {
        onSuccess: () => {
          applyCoupon(couponCode.trim(), {
            onSuccess: () => {
              setCouponCode("");
              setCouponError("");
              setCouponSuccess(true);
              setTimeout(() => setCouponSuccess(false), 3000);
            },
            onError: (error: unknown) => {
              setCouponError(getErrorMessage(error, "Failed to apply coupon"));
            },
          });
        },
        onError: (error: unknown) => {
          setCouponError(getErrorMessage(error, "Invalid coupon code"));
        },
      }
    );
  };

  const handleRemoveCoupon = () => {
    removeCoupon(undefined, {
      onSuccess: () => {
        setCouponError("");
        setCouponSuccess(true);
        setTimeout(() => setCouponSuccess(false), 3000);
      },
      onError: (error: unknown) => {
        const message = getErrorMessage(error, "Failed to remove coupon");
        console.error("[CartPage] Error removing coupon:", message);
        setCouponError(message);
      },
    });
  };

  // Fetch product/variant data for guest items
  useEffect(() => {
    if (!isAuthenticated && guestItems.length > 0) {
      const variantIds = guestItems.map((item) => item.variantId);

      getProductVariantsByIds(variantIds)
        .then((variants) => {
          const data: Record<number, VariantDisplayData> = {};

          variants.forEach((variant) => {
            data[variant.id] = {
              price: variant.price ? String(variant.price) : "0",
              image: variant.image || variant.image_override || "",
              size: variant.size || "",
              color: variant.color || "",
              productName: variant.product_name || "",
            };
          });

          setVariantData(data);
        })
        .catch((err) => {
          console.error("[CartPage] Error fetching variant data:", err);
          const data: Record<number, VariantDisplayData> = {};
          variantIds.forEach((id) => {
            data[id] = { price: "0", image: "", size: "", color: "" };
          });
          setVariantData(data);
        });
    }
  }, [guestItems, isAuthenticated]);

  const authenticatedItems: DisplayCartItem[] = [
    ...(authenticatedCart?.variant_items ?? []),
    ...(authenticatedCart?.bundle_items ?? []),
  ];

  const allItems: DisplayCartItem[] = isAuthenticated ? authenticatedItems : guestItems;
  const itemCount = allItems.reduce((sum, item) => sum + item.quantity, 0);
  const isLoading = isAuthenticated ? cartLoading : false;

  // Guest totals come from the shared calculator so the coupon, the buy-X-get-Y
  // offer and the stacking rule between them match what the server will charge
  // once this cart is merged into an account.
  const {
    subtotal: guestSubtotal,
    discountAmount: guestDiscountAmount,
    total: guestTotal,
    appliedOffer: guestOffer,
  } = useGuestCartCalculations(
    guestItems.map((item) => ({
      key: `variant:${item.variantId}`,
      price: parseFloat(item.price || "0"),
      quantity: item.quantity,
      productId: item.productId,
      categoryIds: item.categoryIds,
    }))
  );

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cart Content */}
      <div className="flex flex-col lg:flex-row gap-8 px-6 py-8 md:px-8 max-w-7xl mx-auto">
        {/* Left: Items */}
        <div className="flex-1">
        {allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-600 text-2xl font-semibold mb-8">Your bag is empty.</p>
              <div className="space-y-3 mb-8 w-full max-w-xs">
                <Link 
                  href="/collections/women" 
                  className="flex h-11 w-full items-center justify-center bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors text-sm font-semibold"
                >
                  Shop Women
                </Link>
                <Link 
                  href="/collections/men" 
                  className="flex h-11 w-full items-center justify-center bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors text-sm font-semibold"
                >
                  Shop Men
                </Link>
                <Link 
                  href="/collections/kids" 
                  className="flex h-11 w-full items-center justify-center bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors text-sm font-semibold"
                >
                  Shop Kids
                </Link>
              </div>

              {/* Guest Discount Display at Bottom (Even when empty) */}
              {getGuestDiscount() && (
                <div className="border-t border-gray-200 pt-6 mt-8 flex items-center justify-center gap-4 w-full max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">Discount Saved:</span>
                    <span className="text-base font-bold text-black flex items-center gap-1">
                      <TicketIcon size={18} weight="fill" className="text-black" />
                      First order
                    </span>
                  </div>
                  <div className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold">
                    {getGuestDiscount()?.discountType === "percent" 
                      ? `${getGuestDiscount()?.discountAmount}% Off`
                      : `USD ${getGuestDiscount()?.discountAmount} Off`}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-black">Shopping Bag</h1>
                <p className="text-sm text-gray-500">{itemCount} items</p>
              </div>

              {/* Items */}
              <div className="space-y-6 pb-6 border-b border-gray-200">
              {allItems.map((item) => {
                const isGuestItem = isGuestCartItem(item);
                const uniqueKey = isGuestItem ? `guest-${item.variantId}` : item.id;

                let priceValue = "0";
                let imageUrl = "";
                let colorValue = "";
                let sizeValue = "";
                let productName = "Product";

                if (isGuestItem) {
                  const fetchedData = variantData[item.variantId];
                  productName = item.productName;
                  priceValue = item.price || fetchedData?.price || "0";
                  imageUrl = fetchedData?.image || "";
                  colorValue = fetchedData?.color || "";
                  sizeValue = fetchedData?.size || "";
                } else {
                  // For authenticated items, variant is now a full object from backend
                  if (isVariantCartItem(item)) {
                    const fetchedData = variantData[item.variant.id];
                    productName =
                      item.variant.product_name ||
                      fetchedData?.productName ||
                      item.variant.title ||
                      `Variant ${item.variant.id}`;
                    priceValue = item.variant.price || "0";
                    colorValue = item.variant.color || "";
                    sizeValue = item.variant.size || "";
                    imageUrl = item.variant.image || item.variant.image_override || fetchedData?.image || "";
                  } else {
                    productName = item.bundle?.name ?? "Product";
                    priceValue = item.bundle?.price ?? "0";
                  }
                }
                const variantDetails = formatVariantDetails(colorValue, sizeValue);

                return (
                  <div key={uniqueKey} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                    {/* Image */}
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={productName}
                        width={96}
                        height={112}
                        unoptimized
                        className="w-24 h-28 object-cover rounded-md bg-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-28 bg-gray-200 rounded-md flex-shrink-0" />
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-black">
                        {productName}
                      </h3>

                      {/* Variant Info */}
                      {variantDetails && (
                        <p className="text-sm text-gray-600 mt-1">
                          {variantDetails}
                        </p>
                      )}

                      {/* Original Price */}
                      <p className="font-semibold text-sm text-black mt-2">
                        {isGuestItem ? "USD" : (authenticatedCart?.currency || "USD")} {parseFloat(priceValue || "0").toLocaleString()}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-300 mt-2 w-fit">
                        <button
                          onClick={() =>
                            isGuestItem
                              ? updateGuestItem(item.variantId, Math.max(1, item.quantity - 1))
                              : updateQuantity({
                                  itemId: item.id,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors font-semibold text-gray-700"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold px-3 text-black w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            isGuestItem
                              ? updateGuestItem(item.variantId, item.quantity + 1)
                              : updateQuantity({
                                  itemId: item.id,
                                  quantity: item.quantity + 1,
                                })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors font-semibold text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Right: Total Price and Delete */}
                    <div className="flex-shrink-0 flex flex-col items-end justify-between">
                      {/* Total Price on Top */}
                      <p className="font-bold text-base text-black">
                        {isGuestItem ? "USD" : (authenticatedCart?.currency || "USD")} {(parseFloat(priceValue || "0") * item.quantity).toLocaleString()}
                      </p>

                      {/* Delete Button on Bottom */}
                      <button
                        onClick={() =>
                          isGuestItem ? removeGuestItem(item.variantId) : removeItem(item.id)
                        }
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        {allItems.length > 0 && (
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-bold text-black mb-4">Order Summary</h2>

              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-black">
                    {authenticatedCart?.currency || "USD"} {isAuthenticated && totals ? totals.subtotal.toLocaleString() : guestSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* Guest Discount Display */}
                {!isAuthenticated && getGuestDiscount() && (
                  <div className="py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-700">First-Order Discount</p>
                        <p className="text-xs text-green-600">Saved for {getGuestDiscount()?.email}</p>
                      </div>
                      <button
                        onClick={() => clearGuestDiscount()}
                        className="text-green-700 hover:text-red-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Coupon Section */}
                {isAuthenticated && (
                  <div className="py-3 border-t border-gray-200">
                    {authenticatedCart?.applied_coupon ? (
                      <div className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-700">Coupon Applied</p>
                          <p className="text-xs text-green-600">{authenticatedCart.applied_coupon}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveCoupon()}
                          className="text-green-700 hover:text-red-600 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError("");
                          }}
                          placeholder="Enter coupon code"
                          className="flex-1 h-11 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || applyingCoupon}
                          className="h-11 px-6 bg-blue-900 text-white text-sm font-semibold rounded-md hover:bg-blue-950 transition-colors disabled:opacity-50"
                        >
                          {validatingCoupon || applyingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
                    {couponSuccess && <p className="text-xs text-green-600 mt-2">Coupon applied successfully!</p>}
                  </div>
                )}

                {isAuthenticated && totals && totals.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{authenticatedCart?.currency || "USD"} {totals.discount.toLocaleString()}</span>
                  </div>
                )}

                {!isAuthenticated && guestOffer && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>
                      {guestOffer.offer.name} &mdash; {guestOffer.freeUnits} item
                      {guestOffer.freeUnits === 1 ? "" : "s"} free
                    </span>
                    <span className="font-semibold">
                      -USD {guestOffer.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {!isAuthenticated && guestDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>First-Order Discount</span>
                    <span className="font-semibold">-USD {guestDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                {isAuthenticated && totals && totals.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold text-black">{authenticatedCart?.currency || "USD"} {totals.tax.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-black">TBD</span>
                </div>
              </div>

              {/* Estimated Total */}
              <div className="flex justify-between text-lg font-bold mb-6 pb-4 border-b border-gray-200">
                <span className="text-black">Estimated Total</span>
                <span className="text-black">
                  {isAuthenticated && totals?.total
                    ? `${authenticatedCart?.currency || "USD"} ${totals.total.toLocaleString()}`
                    : `USD ${guestTotal.toLocaleString()}`}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="flex h-11 w-full items-center justify-center bg-blue-900 text-white rounded-md text-sm font-semibold hover:bg-blue-950 transition-colors mb-3"
              >
                Checkout
              </Link>

              {/* Make It A Gift */}
              <button className="w-full flex items-center justify-between py-2 font-semibold text-black hover:opacity-70 transition-opacity">
                <span>Make It A Gift?</span>
                <span className="text-xl">+</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
