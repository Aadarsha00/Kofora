"use client";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useCallback, useEffect, useId, useMemo } from "react";
import Link from "next/link";
import { Plus, X, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { ColorMixItem, Product, ProductVariant } from "@/interface/Product";
import ProductFeatures from "./ProductFeature";
import { useProductById, useProductBySlug } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useAddToCart } from "@/hooks/useCart";
import { useCartSidebarStore } from "@/store/cartSidebarStore";
import { colorImages, productImages } from "@/lib/productImages";
import { needsSwatchBorder, swatchBackground, variantSwatchColors } from "@/lib/colorMix";

interface ColorGroup {
  color: string;
  label: string;
  swatchColors: ColorMixItem[];
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
  const generalImages = productImages(product).map((image) => image.image);

  const activeVariants = product.variants?.filter((variant) => variant.is_active) ?? [];

  if (activeVariants.length === 0) {
    return [
      {
        color: DEFAULT_COLOR,
        label: "Default",
        swatchColors: variantSwatchColors({ color: "Default", color_mix: [] }),
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

      const scopedVariantImages = colorImages(product, color).map((img) => img.image);

      groups.push({
        color,
        label: hasText(colorLabel) ? colorLabel : "Default",
        swatchColors: variantSwatchColors(variant),
        sizes: size ? [size] : [],
        variantIds: [variant.id],
        images: scopedVariantImages.length ? scopedVariantImages : generalImages,
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

function buildInternationalShippingLines(product: Product): string[] {
  const details = product.international_shipping_details;

  if (!details) return [];

  const rate = `${details.currency} ${details.base_rate}`;
  const duties = {
    customer: "Duties and taxes are paid by the customer",
    merchant: "Duties and taxes are paid by Kofora",
    included: "Duties and taxes are included",
  }[details.duties_paid_by];

  return [
    details.destination_country
      ? `Destination: ${details.destination_country}${details.destination_region ? `, ${details.destination_region}` : ""}`
      : "",
    details.service_name ? `Service: ${details.service_name}` : "",
    details.carrier ? `Carrier: ${details.carrier}` : "",
    details.delivery_time ? `Delivery: ${details.delivery_time}` : "",
    details.handling_time ? `Handling: ${details.handling_time}` : "",
    `Rate: ${rate}`,
    Number(details.additional_item_rate) > 0
      ? `Each additional item: ${details.currency} ${details.additional_item_rate}`
      : "",
    details.free_shipping_threshold
      ? `Free shipping from ${details.currency} ${details.free_shipping_threshold}`
      : "",
    duties,
    details.customs_notes,
    details.restrictions,
    details.notes,
  ].filter(hasText);
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

  const queryProductId = Number(searchParams.get("id"));
  const id =
    productId ??
    (Number.isFinite(queryProductId) && queryProductId > 0 ? queryProductId : undefined);
  const shouldFetchBySlug = !id && hasText(slug);
  const productByIdQuery = useProductById(id);
  const productBySlugQuery = useProductBySlug(slug ?? "", shouldFetchBySlug);
  const product = productByIdQuery.data ?? productBySlugQuery.data;
  const isLoading = id ? productByIdQuery.isLoading : productBySlugQuery.isLoading;
  const isError = id ? productByIdQuery.isError : productBySlugQuery.isError;

  const colorGroups = useMemo(
    () => (product ? buildColorGroups(product) : []),
    [product]
  );
  const internationalShippingLines = useMemo(
    () => (product ? buildInternationalShippingLines(product) : []),
    [product]
  );

  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const shippingReturnsId = useId();
  const productDetailsId = useId();

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
      {
        color: DEFAULT_COLOR,
        label: "Default",
        swatchColors: variantSwatchColors({ color: "Default", color_mix: [] }),
        sizes: [],
        variantIds: [],
        images: [],
      };
    const variant = getSelectedVariant(product, group, selectedSize);

    if (group?.sizes.length && !selectedSize) {
      alert("Please select a size");
      return;
    }

    if (!variant) {
      const message =
        product.variants.length === 0
          ? "This product is currently unavailable."
          : "Please select a valid variant";
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
      addToCart(
        { variantId: variant.id, quantity: 1 },
        {
          onSuccess: () => {
            openCart();
          },
          onError: (error: unknown) => {
            console.error("[handleAddToBag] ❌ addToCart error:", error);
            alert(getErrorMessage(error));
          },
        }
      );
    } else {
      addGuestItem(variant.id, product.name, 1, variant.price, availableQuantity);
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
  const shippingDetails = product.international_shipping_details;
  const purchaseReassurance = [
    shippingDetails?.free_shipping_threshold
      ? `Free shipping over ${shippingDetails.currency} ${shippingDetails.free_shipping_threshold}`
      : shippingDetails
        ? "International shipping available"
        : "",
    "30-day returns",
  ]
    .filter(hasText)
    .join(" + ");

  let variantSpecificImages: string[] = [];
  if (selectedVariant) {
    variantSpecificImages = colorImages(product, selectedVariant.color).map((img) => img.image);
  }
  const images = variantSpecificImages.length > 0 ? variantSpecificImages : (group?.images.length ? group.images : []);
  const total = images.length;
  const currentImageIndex = total > 0 ? Math.min(imageIndex, total - 1) : 0;

  const prev = () => setImageIndex(currentImageIndex === 0 ? total - 1 : currentImageIndex - 1);
  const next = () => setImageIndex(currentImageIndex === total - 1 ? 0 : currentImageIndex + 1);

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

      <div className="w-full px-4 py-6 lg:py-10 lg:pl-16 lg:pr-0">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* ── PHOTO (right) — big image 1, image 2 peeks past the edge, ← N/total → pill at the bottom in the gap ── */}
          <div className={`order-1 w-full lg:order-2 lg:flex-1 lg:min-w-0 ${isModal ? "" : "lg:translate-x-8"}`}>
            <div className="relative w-full overflow-hidden [--slide:85%] lg:[--slide:min(72%,calc(100vh-10rem))]">
              {total > 0 ? (
                <>
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{
                      transform: `translateX(calc(-${currentImageIndex} * var(--slide)))`,
                    }}
                  >
                    {images.map((img, i) => (
                      <div key={i} style={{ width: "var(--slide)" }} className="shrink-0 pr-1.5">
                        <div className="relative aspect-square w-full overflow-hidden bg-[#f4f1ec] lg:aspect-[1.1/1]">
                          <Image
                            src={img}
                            alt={`${product.name} view ${i + 1}`}
                            fill
                            priority={!isModal && i === 0}
                            sizes="(min-width: 1024px) min(72vw, calc(100vh - 10rem)), 85vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {total > 1 && (
                    <div className="absolute bottom-0 left-[var(--slide)] flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                      <button onClick={prev} aria-label="Previous image" className="text-black transition hover:opacity-60">
                        <ArrowLeft size={16} />
                      </button>
                      <span className="text-sm font-medium tabular-nums text-black">
                        {currentImageIndex + 1} / {total}
                      </span>
                      <button onClick={next} aria-label="Next image" className="text-black transition hover:opacity-60">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative aspect-square w-[var(--slide)] overflow-hidden bg-[#E8E6E1] lg:aspect-[1.1/1]" />
              )}
            </div>
          </div>

          {/* ── DETAIL (left on desktop, below photo on mobile) ── */}
          <div className={`order-2 w-full lg:order-1 lg:w-105 lg:shrink-0 ${isModal ? "" : "lg:translate-x-8"}`}>
            <p className="mb-4 flex items-center gap-1 text-xs text-gray-400">
              <Link
                href={`/collections/${gender}`}
                className="capitalize text-gray-400 hover:underline"
              >
                {gender}
              </Link>
              <span>/</span>
              <Link
                href={`/collections/${gender}/${slug}`}
                className="text-gray-400 hover:underline"
              >
                {slug}
              </Link>
            </p>

            <h1 className="mb-4 text-3xl font-bold leading-tight text-black md:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-5 flex items-center gap-3">
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
              <div className="mb-5">
                <p className="mb-2 text-sm font-medium text-black">
                  Color:{" "}
                  <span className="font-normal text-gray-600">{group?.label}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorGroups.map((g, i) => (
                    <button
                      key={i}
                      title={g.label}
                      onClick={() => handleColorChange(i)}
                      className={`h-9 w-9 rounded-full transition-all duration-200 ${
                        i === activeColorIndex
                          ? "ring-2 ring-black ring-offset-2"
                          : "hover:ring-1 hover:ring-gray-400 hover:ring-offset-1"
                      }`}
                      style={{
                        background: swatchBackground(g.swatchColors),
                        border: needsSwatchBorder(g.swatchColors) ? "1px solid #ccc" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {group?.sizes.length > 0 && (
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-black">
                    Size:{" "}
                    <span className="font-normal text-gray-700">{selectedSize ?? ""}</span>
                  </p>
                  <Link
                    href="/size-chart"
                    className="text-sm text-gray-500 underline transition-colors hover:text-black"
                  >
                    Size Guide
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2">
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
                        className={`rounded-lg py-3 text-sm text-black transition-all ${
                          selectedSize === size
                            ? "border-2 border-black bg-white font-semibold"
                            : "border border-gray-200 bg-gray-100 hover:border-gray-400 hover:bg-gray-50"
                        } ${
                          !sizeAvailable
                            ? "cursor-not-allowed line-through opacity-40 hover:border-gray-200 hover:bg-gray-100"
                            : ""
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Bag */}
            <button
              onClick={handleAddToBag}
              disabled={addToCartPending || !isPurchasable}
              title={!isPurchasable ? "This product does not have a purchasable variant." : undefined}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-[#253E38] text-sm font-bold text-white transition-colors hover:bg-[#1e3530] disabled:opacity-60"
            >
              {!isPurchasable ? "Unavailable" : addToCartPending ? "Adding..." : "Add to Bag"}
            </button>

            {!isPurchasable && (
              <p className="mt-2 text-xs text-red-600">
                This product is currently unavailable.
              </p>
            )}

            {/* Purchase reassurance and detail accordions */}
            <p className="px-3 py-3 text-center text-[11px] font-semibold tracking-[0.02em] text-[#253E38]">
              {purchaseReassurance}
            </p>

            <div className="border-t border-gray-300">
              <div className="border-b border-gray-300">
                <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left text-[13px] font-semibold text-black transition-colors hover:text-[#253E38]"
                  onClick={() => setShippingOpen(!shippingOpen)}
                  aria-expanded={shippingOpen}
                  aria-controls={shippingReturnsId}
                >
                  <span>Shipping &amp; Return Details</span>
                  <Plus
                    size={18}
                    aria-hidden="true"
                    className={`shrink-0 transition-transform duration-200 ${shippingOpen ? "rotate-45" : ""}`}
                  />
                </button>
                {shippingOpen && (
                  <div
                    id={shippingReturnsId}
                    className="grid gap-6 pb-6 text-[12px] leading-5 text-gray-600"
                  >
                    <section aria-labelledby={`${shippingReturnsId}-shipping`}>
                      <h2
                        id={`${shippingReturnsId}-shipping`}
                        className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black"
                      >
                        International shipping
                      </h2>
                      {internationalShippingLines.length > 0 ? (
                        <ul className="grid gap-1">
                          {internationalShippingLines.map((line, index) => (
                            <li key={`${line}-${index}`}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>
                          International shipping details are not available for this item.
                          Contact us before ordering to confirm delivery options for your destination.
                        </p>
                      )}
                    </section>

                    <section aria-labelledby={`${shippingReturnsId}-returns`}>
                      <h2
                        id={`${shippingReturnsId}-returns`}
                        className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black"
                      >
                        Returns
                      </h2>
                      <ul className="grid list-disc gap-1 pl-4">
                        <li>Request a return within 30 days of delivery.</li>
                        <li>Items must be unused, unworn, in original condition, and in original packaging.</li>
                        <li>
                          Customers pay return shipping. Kofora covers it only when the item is defective or incorrect.
                        </li>
                        <li>Original shipping charges are non-refundable unless the return is due to our error.</li>
                      </ul>
                      {hasText(product.international_shipping_details?.return_policy) && (
                        <p className="mt-3 border-l-2 border-[#253E38] pl-3">
                          <span className="font-semibold text-black">Additional return note: </span>
                          {product.international_shipping_details.return_policy}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        <Link
                          href="/refund-policy"
                          className="font-semibold text-black underline decoration-1 underline-offset-4 transition-colors hover:text-[#253E38]"
                        >
                          Read the full policy
                        </Link>
                        <Link
                          href="/contact?topic=returns"
                          className="font-semibold text-black underline decoration-1 underline-offset-4 transition-colors hover:text-[#253E38]"
                        >
                          Start a return request
                        </Link>
                      </div>
                    </section>
                  </div>
                )}
              </div>

              {product.full_description && (
                <div className="border-b border-gray-300">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-[13px] font-semibold text-black transition-colors hover:text-[#253E38]"
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    aria-expanded={detailsOpen}
                    aria-controls={productDetailsId}
                  >
                    <span>Product &amp; Material Details</span>
                    <Plus
                      size={18}
                      aria-hidden="true"
                      className={`shrink-0 transition-transform duration-200 ${detailsOpen ? "rotate-45" : ""}`}
                    />
                  </button>
                  {detailsOpen && (
                    <p id={productDetailsId} className="pb-6 text-[12px] leading-5 text-gray-600">
                      {product.full_description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductFeatures product={product} />
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
