"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useCart, useRemoveFromCart, useUpdateCartItem, useCartTotals, useApplyCoupon, useRemoveCoupon } from "@/hooks/useCart";
import { useValidateCoupon } from "@/hooks/useDiscounts";
import { useGuestDiscount } from "@/hooks/useGuestDiscount";
import { Trash2, X } from "lucide-react";
import { HandbagIcon, TicketIcon } from "@phosphor-icons/react";
import Link from "next/link";
import api from "@/axios/api.axios";

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

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to convert hex code to color name
function getColorName(hex: string): string {
  if (!hex) return "";
  const normalized = hex.toLowerCase();
  return hexToColorName[normalized] || hex; // Return original hex if not found
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
  maxAvailable?: number;
};

type VariantDisplayData = {
  price?: string;
  image?: string;
  size?: string;
  color?: string;
  productName?: string;
  availableQuantity?: number;
};

type ProductImageLookup = {
  image?: string;
  is_active?: boolean;
  variant_id?: number | null;
};

type ProductVariantLookup = {
  id: number;
  price?: string | number;
  size?: string;
  color?: string;
  available_quantity?: number;
};

type ProductLookup = {
  name?: string;
  images?: ProductImageLookup[];
  variants?: ProductVariantLookup[];
};

type ProductsListResponse = {
  data?: {
    results?: ProductLookup[];
  };
  results?: ProductLookup[];
};

type AuthVariant = {
  id: number;
  product_name?: string;
  title?: string;
  price?: string;
  color?: string;
  size?: string;
  available_quantity?: number;
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

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [variantData, setVariantData] = useState<Record<number, VariantDisplayData>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const { getGuestDiscount, clearGuestDiscount } = useGuestDiscount();
  
  const { isAuthenticated } = useAuth();
  console.log("[CartSidebar] Rendering - isAuthenticated:", isAuthenticated);
  
  const { data: authenticatedCart, isLoading: cartLoading } = useCart();
  const { mutate: removeItem } = useRemoveFromCart();
  const { mutate: updateQuantity } = useUpdateCartItem();
  const totals = useCartTotals();
  const guestItems = useGuestCartStore((state) => state.items);
  const loadGuestCart = useGuestCartStore((state) => state.loadFromStorage);
  const removeGuestItem = useGuestCartStore((state) => state.removeItem);
  const updateGuestItem = useGuestCartStore((state) => state.updateItem);
  
  const { mutate: validateCoupon, isPending: validatingCoupon } = useValidateCoupon();
  const { mutate: applyCoupon, isPending: applyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon } = useRemoveCoupon();

  useEffect(() => {
    console.log("[CartSidebar] Mounting, loading guest cart from storage");
    const frame = requestAnimationFrame(() => {
      setHasMounted(true);
      loadGuestCart();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadGuestCart]);

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
        console.log("[CartSidebar] Coupon removed successfully");
        setCouponError("");
        setCouponSuccess(true);
        setTimeout(() => setCouponSuccess(false), 3000);
      },
      onError: (error: unknown) => {
        const message = getErrorMessage(error, "Failed to remove coupon");
        console.error("[CartSidebar] Error removing coupon:", message);
        setCouponError(message);
      },
    });
  };

  // Fetch product/variant data (prices and images) for guest items
  useEffect(() => {
    console.log("[CartSidebar] useEffect - guestItems:", guestItems, "isAuthenticated:", isAuthenticated);
    
    if (!isAuthenticated && guestItems.length > 0) {
      console.log("[CartSidebar] Fetching variant data for guest items");
      const variantIds = guestItems.map((item) => item.variantId);
      console.log("[CartSidebar] variantIds to fetch:", variantIds);
      
      api
        .get(`/products/?page_size=100`)
        .then((res: { data: ProductsListResponse }) => {
          const data: Record<number, VariantDisplayData> = {};
          const products = res.data.data?.results || res.data?.results || [];
          
          products.forEach((product) => {
            if (product.variants) {
              product.variants.forEach((variant) => {
                if (variantIds.includes(variant.id)) {
                  // Get variant-specific images first, then fall back to general product images
                  const variantImages = product.images?.filter(
                    (img) => img.is_active && img.variant_id === variant.id
                  ) || [];
                  
                  const generalImages = product.images?.filter(
                    (img) => img.is_active && img.variant_id === null
                  ) || [];

                  // Fall back to any active images
                  const anyImages = product.images?.filter((img) => img.is_active) || [];
                  
                  const image = variantImages[0]?.image || generalImages[0]?.image || anyImages[0]?.image || "";
                  
                  data[variant.id] = {
                    price: variant.price ? String(variant.price) : "0",
                    image: image,
                    size: variant.size || "",
                    color: variant.color || "",
                    productName: product.name || "",
                    availableQuantity: variant.available_quantity,
                  };

                  console.log("[CartSidebar] Variant " + variant.id + ":", { image, size: variant.size, color: variant.color });
                }
              });
            }
          });
          
          console.log("[CartSidebar] Fetched variant data:", data);
          setVariantData(data);
        })
        .catch((err) => {
          console.error("[CartSidebar] Error fetching variant data:", err);
          // On error, set default data
          const data: Record<number, VariantDisplayData> = {};
          variantIds.forEach((id) => {
            data[id] = { price: "0", image: "", size: "", color: "" };
          });
          setVariantData(data);
        });
    }
  }, [guestItems, isAuthenticated]);

  // Fetch variant images for authenticated items
  useEffect(() => {
    if (isAuthenticated && authenticatedCart?.variant_items && authenticatedCart.variant_items.length > 0) {
      const variantIds = authenticatedCart.variant_items
        .map((item) => item.variant?.id)
        .filter((id): id is number => Boolean(id));
      
      if (variantIds.length === 0) return;

      api
        .get(`/products/?page_size=100`)
        .then((res: { data: ProductsListResponse }) => {
          const data: Record<number, VariantDisplayData> = {};
          const products = res.data.data?.results || res.data?.results || [];

          products.forEach((product) => {
            if (product.variants) {
              product.variants.forEach((variant) => {
                if (variantIds.includes(variant.id)) {
                  // Get variant-specific images first, then fall back to product images
                  const variantImages = product.images?.filter(
                    (img) => img.is_active && img.variant_id === variant.id
                  ) || [];
                  
                  const generalImages = product.images?.filter(
                    (img) => img.is_active && img.variant_id === null
                  ) || [];

                  const anyImages = product.images?.filter((img) => img.is_active) || [];
                  
                  const image = variantImages[0]?.image || generalImages[0]?.image || anyImages[0]?.image || "";
                  
                  data[variant.id] = { image, productName: product.name || "" };
                }
              });
            }
          });

          setVariantData(prev => ({ ...prev, ...data }));
        })
        .catch((err) => {
          console.error("[CartSidebar] Error fetching authenticated variant images:", err);
        });
    }
  }, [isAuthenticated, authenticatedCart]);

  const authenticatedItems: DisplayCartItem[] = [
    ...(authenticatedCart?.variant_items ?? []),
    ...(authenticatedCart?.bundle_items ?? []),
  ];

  const allItems: DisplayCartItem[] = isAuthenticated ? authenticatedItems : guestItems;
  console.log("[CartSidebar] Render - isAuthenticated:", isAuthenticated, "allItems:", allItems);
  
  const itemCount = allItems.reduce((sum, item) => sum + item.quantity, 0);
  const isLoading = isAuthenticated ? cartLoading : false;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full max-w-sm bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center relative">
            <HandbagIcon size={32} />
            {hasMounted && itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-black flex-1 text-center">Shopping Bag</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {!hasMounted ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading cart...</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* Empty State Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-gray-600 text-lg font-semibold">Your bag is empty.</p>
              <div className="space-y-3 w-full px-6">
                <Link
                  href="/collections/women"
                  onClick={onClose}
                  className="block w-full bg-gray-100 text-black text-center py-3 rounded-md hover:bg-gray-200 transition-colors font-semibold"
                >
                  Shop Women
                </Link>
                <Link
                  href="/collections/men"
                  onClick={onClose}
                  className="block w-full bg-gray-100 text-black text-center py-3 rounded-md hover:bg-gray-200 transition-colors font-semibold"
                >
                  Shop Men
                </Link>
                <Link
                  href="/collections/kids"
                  onClick={onClose}
                  className="block w-full bg-gray-100 text-black text-center py-3 rounded-md hover:bg-gray-200 transition-colors font-semibold"
                >
                  Shop Kids
                </Link>
              </div>
            </div>

            {/* Guest Discount Display at Bottom (Even when empty) */}
            {getGuestDiscount() && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3 bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-black">Discount Saved:</span>
                  <span className="text-sm font-bold text-black flex items-center gap-1">
                    <TicketIcon size={16} weight="fill" className="text-black" />
                    First order
                  </span>
                </div>
                <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {getGuestDiscount()?.discountType === "percent" 
                    ? `${getGuestDiscount()?.discountAmount}% Off`
                    : `USD ${getGuestDiscount()?.discountAmount} Off`}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {allItems.map((item) => {
                const isGuestItem = isGuestCartItem(item);
                const uniqueKey = isGuestItem ? `guest-${item.variantId}` : item.id;
                
                // Get price, image, color, size from fetched data or stored data
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
                    imageUrl = fetchedData?.image || "";
                  } else {
                    productName = item.bundle?.name ?? "Product";
                    priceValue = item.bundle?.price ?? "0";
                  }
                }
                const variantDetails = formatVariantDetails(colorValue, sizeValue);

                return (
                  <div
                    key={uniqueKey}
                    className="flex gap-3 border-b border-gray-200 pb-3"
                  >
                    {/* Image */}
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={productName}
                        width={80}
                        height={96}
                        unoptimized
                        className="w-20 h-24 object-cover rounded-md flex-shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-20 h-24 bg-gray-200 rounded-md flex-shrink-0" />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Top: Product Info */}
                      <div>
                        <p className="font-bold text-base text-black leading-tight">
                          {productName}
                        </p>
                        
                        {/* Variant Info - Convert hex to color names */}
                        {variantDetails && (
                          <p className="text-xs text-gray-600 mt-2 font-medium">
                            {variantDetails}
                          </p>
                        )}
                        
                        {/* Unit Price */}
                        <p className="font-semibold text-sm text-black mt-3">
                          {isGuestItem ? "USD" : (authenticatedCart?.currency || "USD")} {parseFloat(priceValue || "0").toLocaleString()}
                        </p>
                      </div>

                      {/* Bottom: Quantity Controls */}
                      <div className="flex items-center gap-2">
                        {/* Quantity Controls - HORIZONTAL */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-300">
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
                    </div>

                    {/* Right: Total Price and Delete */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      {/* Total Price at top */}
                      <p className="font-bold text-base text-black leading-tight">
                        {isGuestItem ? "USD" : (authenticatedCart?.currency || "USD")}
                        <br />
                        <span className="text-lg">{(parseFloat(priceValue || "0") * item.quantity).toLocaleString()}</span>
                      </p>

                      {/* Delete Button at bottom right */}
                      <button
                        onClick={() =>
                          isGuestItem ? removeGuestItem(item.variantId) : removeItem(item.id)
                        }
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 space-y-3 flex-shrink-0 bg-white">
              {/* Coupon Section */}
              {/* Guest/First-Order Discount Display */}
              {getGuestDiscount() && (
                <div className="pb-3 border-b border-gray-200">
                  <div className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-700">First-Order Discount Applied</p>
                      <p className="text-xs text-green-600">Saved for {getGuestDiscount()?.email}</p>
                    </div>
                    <button
                      onClick={() => clearGuestDiscount()}
                      className="text-green-700 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Authenticated Coupon Input */}
              {isAuthenticated && (
                <div className="pb-3 border-b border-gray-200">
                  {authenticatedCart?.applied_coupon ? (
                    <div className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-green-700">Coupon Applied</p>
                        <p className="text-xs text-green-600">{authenticatedCart.applied_coupon}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveCoupon()}
                        className="text-green-700 hover:text-red-600 transition-colors"
                      >
                        <X size={16} />
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
                        placeholder="Coupon code"
                        className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || applyingCoupon}
                        className="px-2 py-2 bg-blue-900 text-white text-xs font-semibold rounded-md hover:bg-blue-950 transition-colors disabled:opacity-50"
                      >
                        {validatingCoupon || applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-green-600 mt-1">Coupon applied!</p>}
                </div>
              )}

              {/* Checkout Button with Total Price */}
              {(() => {
                // Calculate guest total with discount
                const guestSubtotal = guestItems.reduce((sum, item) => sum + parseFloat(item.price || "0") * item.quantity, 0);
                const guestDiscount = getGuestDiscount();
                let guestDiscountAmount = 0;
                if (guestDiscount) {
                  if (guestDiscount.discountType === "percent") {
                    guestDiscountAmount = guestSubtotal * (guestDiscount.discountAmount / 100);
                  } else {
                    guestDiscountAmount = Math.min(guestDiscount.discountAmount, guestSubtotal);
                  }
                }
                const guestTotal = guestSubtotal - guestDiscountAmount;
                
                return (
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full bg-blue-900 text-white text-center py-3 rounded-md font-semibold hover:bg-blue-950 transition-colors"
                  >
                    Checkout
                    {isAuthenticated && totals?.total
                      ? ` - USD ${totals.total.toLocaleString()}`
                      : !isAuthenticated && guestItems.length > 0
                        ? ` - USD ${guestTotal.toLocaleString()}`
                        : ""}
                  </Link>
                );
              })()}

              {/* View Bag Link */}
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full text-center py-2 text-black font-semibold hover:underline transition-colors"
              >
                View Bag
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
