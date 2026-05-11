"use client";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, X, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Product, ProductVariant } from "@/interface/Product";
import ProductFeatures from "./ProductFeature";
import { useProductById } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useAddToCart } from "@/hooks/useCart";
import { useCartSidebarStore } from "@/store/cartSidebarStore";

interface ColorGroup {
  color: string;
  label: string;
  sizes: string[];
  variantIds: number[];
  images: string[];
}

const DEFAULT_COLOR = "#888888";

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to add item to cart";
}

function buildColorGroups(product: Product): ColorGroup[] {
  const generalImages = product.images
    .filter((i) => i.is_active && i.variant_id === null)
    .map((i) => i.image);

  const activeVariants = product.variants?.filter((variant) => variant.is_active) ?? [];

  if (activeVariants.length === 0) {
    return [
      {
        color: DEFAULT_COLOR,
        label: "Default",
        sizes: [],
        variantIds: [],
        images: generalImages.length
          ? generalImages
          : product.images.filter((i) => i.is_active).map((i) => i.image),
      },
    ];
  }

  const groups: ColorGroup[] = [];

  for (const variant of activeVariants) {
    const size = variant.size?.trim() ?? "";
    const color = variant.color?.trim() || DEFAULT_COLOR;

    const existing = groups.find((g) => g.color === color);
    if (existing) {
      if (size && !existing.sizes.includes(size)) existing.sizes.push(size);
      existing.variantIds.push(variant.id);
    } else {
      const title = variant.title?.trim() ?? "";
      const colorLabel = title.includes("/")
        ? title.split("/")[0].trim()
        : variant.color?.trim();

      const variantImages = product.images
        .filter((img) => img.is_active && img.variant_id === variant.id)
        .map((img) => img.image);

      groups.push({
        color,
        label: hasText(colorLabel) ? colorLabel : "Default",
        sizes: size ? [size] : [],
        variantIds: [variant.id],
        images: variantImages.length ? variantImages : generalImages,
      });
    }
  }

  return groups;
}

function getSelectedVariant(
  product: Product,
  group: ColorGroup | undefined,
  activeSize: string | null
): ProductVariant | undefined {
  if (!group) {
    return product.variants.find((v) => v.is_active) ?? product.variants[0];
  }

  return (
    product.variants.find(
      (v) => group.variantIds.includes(v.id) && v.size?.trim() === activeSize
    ) ?? product.variants.find((v) => group.variantIds.includes(v.id))
  );
}

function isVariantPurchasable(variant: ProductVariant | undefined): variant is ProductVariant {
  return Boolean(variant?.is_active && variant.available_quantity > 0);
}

function getFirstPurchasableSize(product: Product | undefined, group: ColorGroup | undefined): string | null {
  if (!product || !group) return null;

  const variant = product.variants.find(
    (item) => group.variantIds.includes(item.id) && isVariantPurchasable(item)
  );

  return variant?.size?.trim() || null;
}

export default function ProductDetails({
  isModal = false,
  onClose,
  productId,
}: {
  isModal?: boolean;
  onClose?: () => void;
  productId?: number;
}) {
  const { gender, slug } = useParams<{ gender: string; slug: string }>();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { mutate: addToCart, isPending: addToCartPending } = useAddToCart();
  const addGuestItem = useGuestCartStore((state) => state.addItem);
  const guestItems = useGuestCartStore((state) => state.items);
  const { openCart } = useCartSidebarStore();

  const id = productId ?? Number(searchParams.get("id"));
  const { data: product, isLoading, isError } = useProductById(id);

  const colorGroups = useMemo(
    () => (product ? buildColorGroups(product) : []),
    [product]
  );

  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const activeColorIndex = colorGroups[activeColor] ? activeColor : 0;
  const activeGroup = colorGroups[activeColorIndex] ?? colorGroups[0];
  const selectedSize = activeGroup?.sizes.length
    ? activeSize && activeGroup.sizes.includes(activeSize)
      ? activeSize
      : getFirstPurchasableSize(product, activeGroup) ?? activeGroup.sizes[0]
    : null;

  useEffect(() => {
    if (!isModal) return;
    const t = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = "";
    };
  }, [isModal]);

  const handleClose = useCallback(() => {
    if (!isModal) return;
    setVisible(false);
    setTimeout(() => onClose?.(), 350);
  }, [onClose, isModal]);

  const handleColorChange = useCallback(
    (i: number) => {
      setActiveColor(i);
      setImageIndex(0);
      setActiveSize(colorGroups[i]?.sizes[0] ?? null);
    },
    [colorGroups]
  );

  function handleAddToBag() {
    if (!product) return;

    const group =
      activeGroup ??
      { color: DEFAULT_COLOR, label: "Default", sizes: [], variantIds: [], images: [] };
    const variant = getSelectedVariant(product, group, selectedSize);

    console.log("[handleAddToBag] ── ADD TO BAG CLICKED ──");
    console.log("[handleAddToBag] Product:", JSON.stringify({ id: product.id, name: product.name }));
    console.log("[handleAddToBag] Color group:", JSON.stringify(group));
    console.log("[handleAddToBag] All product.variants:", JSON.stringify(product.variants));
    console.log("[handleAddToBag] Selected variant:", JSON.stringify(variant));
    console.log("[handleAddToBag] activeSize:", selectedSize);
    console.log("[handleAddToBag] isAuthenticated:", isAuthenticated);
    console.log("[handleAddToBag] Payload that will be sent to backend:", {
      variantId: variant?.id,
      quantity: 1,
    });

    if (group?.sizes.length && !selectedSize) {
      console.log("[handleAddToBag] ❌ Blocked: size required but not selected");
      alert("Please select a size");
      return;
    }

    if (!variant) {
      const message =
        product.variants.length === 0
          ? "This product is currently unavailable."
          : "Please select a valid variant";
      console.log("[handleAddToBag] ❌ Blocked: no variant found. group.variantIds:", group.variantIds);
      alert(message);
      return;
    }

    if (!isVariantPurchasable(variant)) {
      alert("This size is currently out of stock.");
      return;
    }

    const availableQuantity = variant.available_quantity;
    const guestExistingQuantity =
      guestItems.find((item) => item.variantId === variant.id)?.quantity ?? 0;
    if (!isAuthenticated && guestExistingQuantity + 1 > availableQuantity) {
      alert(`Only ${availableQuantity} item${availableQuantity === 1 ? "" : "s"} available.`);
      return;
    }

    if (isAuthenticated) {
      console.log("[handleAddToBag] 🔄 Calling addToCart with variantId:", variant.id);
      addToCart(
        { variantId: variant.id, quantity: 1 },
        {
          onSuccess: (data) => {
            console.log("[handleAddToBag] ✅ addToCart success:", JSON.stringify(data));
            openCart();
          },
          onError: (error: unknown) => {
            console.error("[handleAddToBag] ❌ addToCart error:", error);
            alert(getErrorMessage(error));
          },
        }
      );
    } else {
      console.log("[handleAddToBag] 🛒 Adding to guest cart - variantId:", variant.id, "price:", variant.price);
      addGuestItem(variant.id, product.name, 1, variant.price, availableQuantity);
      console.log("[handleAddToBag] ✅ Guest cart item added, opening cart");
      openCart();
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Product not found.
      </div>
    );
  }

  const group = activeGroup;
  const selectedVariant = getSelectedVariant(product, group, selectedSize);
  const isPurchasable = isVariantPurchasable(selectedVariant);
  const displayPrice = selectedVariant ? parseFloat(selectedVariant.price) : 0;
  const displayOriginal = selectedVariant?.compare_at_price
    ? parseFloat(selectedVariant.compare_at_price)
    : null;

  let variantSpecificImages: string[] = [];
  if (selectedVariant) {
    variantSpecificImages = product.images
      .filter((img) => img.is_active && img.variant_id === selectedVariant.id)
      .map((img) => img.image);
  }
  const images = variantSpecificImages.length > 0 ? variantSpecificImages : (group?.images.length ? group.images : []);
  const total = images.length;
  const currentImageIndex = total > 0 ? Math.min(imageIndex, total - 1) : 0;

  const CAROUSEL_HEIGHT = 650;
  const GAP = 2;
  const SLIDE_WIDTH = 560;
  const CAROUSEL_LEFT = 120;
  const CAROUSEL_TOP = 64;

  const prev = () => setImageIndex(currentImageIndex === 0 ? total - 1 : currentImageIndex - 1);
  const next = () => setImageIndex(currentImageIndex === total - 1 ? 0 : currentImageIndex + 1);
  const mobileImage = images[currentImageIndex];

  const content = (
    <div
      className={
        isModal
          ? "relative flex h-[96vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:w-[92vw]"
          : "relative bg-white flex flex-col w-full min-h-screen"
      }
      style={
        isModal
          ? {
              transform: visible ? "translateY(0)" : "translateY(100%)",
              transition: "transform 350ms cubic-bezier(0.32, 0.72, 0, 1)",
            }
          : {}
      }
      onClick={(e) => e.stopPropagation()}
    >
      {isModal && (
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 text-black hover:opacity-50 transition"
        >
          <X size={22} weight="bold" />
        </button>
      )}

      <div className={`flex shrink-0 flex-col lg:flex-row ${isModal ? "lg:h-[96vh]" : "min-h-screen"}`}>
        <div className="relative order-1 w-full bg-[#f4f1ec] lg:hidden">
          <div className="relative aspect-square w-full overflow-hidden">
            {mobileImage ? (
              <Image
                src={mobileImage}
                alt={`${product.name} view ${currentImageIndex + 1}`}
                fill
                priority={!isModal}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#E8E6E1]" />
            )}
          </div>

          {total > 1 && (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded bg-white/95 px-4 py-2 shadow-sm">
              <button onClick={prev} className="text-black" aria-label="Previous image">
                <ArrowLeft size={18} />
              </button>
              <span className="text-sm font-medium tabular-nums text-black">
                {currentImageIndex + 1} / {total}
              </span>
              <button onClick={next} className="text-black" aria-label="Next image">
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
        {/* ── Left panel ── */}
        <div className="order-2 relative z-10 flex w-full shrink-0 flex-col overflow-y-auto px-5 py-6 lg:order-1 lg:w-137.5 lg:px-10 lg:py-8">
          <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
            <Link
              href={`/collections/${gender}`}
              className="hover:underline capitalize text-gray-400"
            >
              {gender}
            </Link>
            <span>/</span>
            <Link
              href={`/collections/${gender}/${slug}`}
              className="hover:underline text-gray-400"
            >
              {slug}
            </Link>
          </p>

          <h1 className="mb-3 text-3xl font-bold leading-tight text-black md:text-4xl">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-1">
            <p className="text-xl font-medium text-black">
              {product.base_currency}{" "}
              {displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            {displayOriginal && displayOriginal > displayPrice && (
              <p className="text-base text-gray-400 line-through">
                {product.base_currency}{" "}
                {displayOriginal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Color selector */}
          {colorGroups.length > 0 && (
            <div className="mb-4 mt-3">
              <p className="text-sm font-medium mb-2 text-black">
                Color:{" "}
                <span className="font-normal text-gray-600">{group?.label}</span>
              </p>
              <div className="flex gap-2">
                {colorGroups.map((g, i) => (
                  <button
                    key={i}
                    title={g.label}
                    onClick={() => handleColorChange(i)}
                    className={`w-9 h-9 rounded-full transition-all duration-200 ${
                      i === activeColorIndex
                        ? "ring-2 ring-offset-2 ring-black"
                        : "hover:ring-1 hover:ring-gray-400 hover:ring-offset-1"
                    }`}
                    style={{
                      backgroundColor: g.color,
                      border:
                        g.color === "#FFFFFF" ||
                        g.color === "#ffffff" ||
                        g.color === "#E8E4DC"
                          ? "1px solid #ccc"
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {group?.sizes.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-black">
                  Size:{" "}
                  <span className="font-normal text-gray-700">
                    {selectedSize ?? ""}
                  </span>
                </p>
                <Link href="/size-chart" className="text-sm underline text-gray-500 hover:text-black transition-colors">
                  Size Guide
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-3">
                {group.sizes.map((size) => {
                  const sizeVariant = getSelectedVariant(product, group, size);
                  const sizeAvailable = isVariantPurchasable(sizeVariant);

                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (!sizeAvailable) return;
                        setActiveSize(size);
                        setImageIndex(0);
                      }}
                      disabled={!sizeAvailable}
                      title={!sizeAvailable ? "Out of stock" : undefined}
                      className={`py-3 text-sm rounded transition-all text-black ${
                        selectedSize === size
                          ? "border-2 border-black font-semibold bg-white"
                          : "border border-gray-200 bg-gray-100 hover:border-gray-400 hover:bg-gray-50"
                      } ${!sizeAvailable ? "opacity-40 line-through cursor-not-allowed hover:border-gray-200 hover:bg-gray-100" : ""}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToBag}
            disabled={addToCartPending || !isPurchasable}
            title={!isPurchasable ? "This product does not have a purchasable variant." : undefined}
            className="w-full bg-[#253E38] text-white py-4 font-bold text-sm hover:bg-[#1e3530] transition-colors mb-3 rounded disabled:opacity-60"
          >
            {!isPurchasable ? "Unavailable" : addToCartPending ? "Adding..." : "Add to Bag"}
          </button>

          {!isPurchasable && (
            <p className="text-xs text-red-600 mb-3">
              This product is currently unavailable.
            </p>
          )}

          {product.short_description && (
            <div className="bg-gray-50 px-5 mb-1">
              <button
                className="w-full flex items-center justify-between py-3.5 text-sm font-semibold text-black"
                onClick={() => setShippingOpen(!shippingOpen)}
              >
                <span>International Shipping + Free Returns Details</span>
                <Plus size={16} />
              </button>
              {shippingOpen && (
                <>
                  <p className="text-xs text-gray-500 pb-2">
                    {product.short_description}
                  </p>
                  <p className="text-xs text-blue-500 underline pb-4 cursor-pointer">
                    Shipping &amp; Return Details
                  </p>
                </>
              )}
            </div>
          )}

          {product.full_description && (
            <div className="bg-gray-50 px-5">
              <button
                className="w-full flex items-center justify-between py-3.5 text-sm font-semibold text-black"
                onClick={() => setDetailsOpen(!detailsOpen)}
              >
                <span>Product &amp; Material Details</span>
                <Plus size={16} />
              </button>
              {detailsOpen && (
                <p className="text-xs text-gray-500 pb-4">
                  {product.full_description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel: carousel ── */}
        <div className="relative hidden flex-1 overflow-hidden lg:block">
          <div
            style={{
              position: "absolute",
              left: `${CAROUSEL_LEFT}px`,
              right: 0,
              top: `${CAROUSEL_TOP}px`,
              height: `${CAROUSEL_HEIGHT}px`,
              overflow: "hidden",
              borderTopLeftRadius: "16px",
              borderBottomLeftRadius: "8px",
            }}
          >
            <ul
              style={{
                display: "flex",
                height: "100%",
                listStyle: "none",
                margin: 0,
                padding: 0,
                transition: "transform 300ms ease",
                transform: `translateX(calc(-${currentImageIndex} * ${SLIDE_WIDTH + GAP}px))`,
              }}
            >
              {images.map((img, i) => (
                <li
                  key={i}
                  style={{
                    flexShrink: 0,
                    width: `${SLIDE_WIDTH}px`,
                    marginRight: `${GAP}px`,
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: i === currentImageIndex ? "16px 0 0 8px" : "0",
                  }}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>

          {total > 1 && (
            <div
              style={{
                position: "absolute",
                left: `${CAROUSEL_LEFT + SLIDE_WIDTH + GAP / 2}px`,
                top: `${CAROUSEL_TOP + CAROUSEL_HEIGHT + 2}px`,
                transform: "translate(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "white",
                padding: "8px 16px",
                borderRadius: "5px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
              }}
            >
              <button onClick={prev} className="hover:opacity-60 transition text-black">
                <ArrowLeft size={18} />
              </button>
              <span className="text-sm font-medium tabular-nums text-black">
                {currentImageIndex + 1} / {total}
              </span>
              <button onClick={next} className="hover:opacity-60 transition text-black">
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductFeatures />
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{
          backgroundColor: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
          transition: "background-color 350ms ease",
        }}
        onClick={handleClose}
      >
        {content}
      </div>
    );
  }

  return content;
}
