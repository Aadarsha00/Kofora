"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Plus, X, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { getProductBySlug } from "@/data/ProductsData";
import ProductFeatures from "./ProductFeature";

export default function ProductDetails({ isModal = false }: { isModal?: boolean }) {
  const { gender, slug } = useParams();
  const router = useRouter();
  const product = getProductBySlug(gender as string, slug as string);

  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState<number | null>(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [visible, setVisible] = useState(false);

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
    setTimeout(() => router.back(), 350);
  }, [router, isModal]);

  const handleColorChange = useCallback((i: number) => {
    setActiveColor(i);
    setImageIndex(0);
  }, []);

  if (!product) return null;

  const variant = product.colors[activeColor];
  const images = variant.images;
  const total = images.length;

  const CAROUSEL_WIDTH = 650;
  const CAROUSEL_HEIGHT = 650;
  const GAP = 2;
  const SLIDE_WIDTH = CAROUSEL_WIDTH;
  const CAROUSEL_LEFT = 0;

  const prev = () => setImageIndex((i) => (i === 0 ? total - 1 : i - 1));
  const next = () => setImageIndex((i) => (i === total - 1 ? 0 : i + 1));

  const content = (
    <div
      className={
        isModal
          ? "relative bg-white flex flex-col w-[92vw] h-[96vh] shadow-2xl overflow-y-auto rounded-t-2xl"
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
      {/* Close — only in modal */}
      {isModal && (
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 text-black hover:opacity-50 transition"
        >
          <X size={22} weight="bold" />
        </button>
      )}

      {/* ── Top: Left + Right panels side by side ── */}
      <div className={`flex shrink-0 ${isModal ? "h-[96vh]" : "min-h-screen"}`}>

        {/* ── LEFT: Info Panel ── */}
        <div className="w-137.5 shrink-0 flex flex-col px-10 py-8 overflow-y-auto">
          <p className="text-xs text-gray-400 mb-4">
            <Link href={`/products/${gender}`} className="hover:underline capitalize text-gray-400">
              {gender}&apos;s
            </Link>
            {" / "}
            <span className="capitalize">{product.category}</span>
            {" / "}
            <span>Product Page →</span>
          </p>

          <h1 className="text-4xl font-bold leading-tight mb-3 text-black">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-1">
            <p className="text-xl font-medium text-black">
              NPR {product.price.toLocaleString()}
            </p>
            {product.originalPrice && (
              <p className="text-base text-gray-400 line-through">
                NPR {product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
          {product.packSavings && (
            <p className="text-sm text-green-700 font-semibold mb-2">
              {product.packSavings}
            </p>
          )}

          <div className="mb-4 mt-3">
            <p className="text-sm font-medium mb-2 text-black">
              Color:{" "}
              <span className="font-normal text-gray-600">{variant.label}</span>
            </p>
            <div className="flex gap-2">
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  title={c.label}
                  onClick={() => handleColorChange(i)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 ${
                    i === activeColor
                      ? "ring-2 ring-offset-2 ring-black"
                      : "hover:ring-1 hover:ring-gray-400 hover:ring-offset-1"
                  }`}
                  style={{
                    backgroundColor: c.color,
                    border:
                      c.color === "#FFFFFF" || c.color === "#E8E4DC"
                        ? "1px solid #ccc"
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-black">
                  Size:{" "}
                  <span className="font-normal text-gray-700">
                    {activeSize ?? ""}
                  </span>
                </p>
                <button className="text-sm underline text-gray-500 hover:text-black transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setActiveSize(size)}
                    className={`py-3 text-sm rounded transition-all text-black ${
                      activeSize === size
                        ? "border-2 border-black font-semibold bg-white"
                        : "border border-gray-200 bg-gray-100 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="w-full bg-[#1e3a5f] text-white py-4 font-bold text-sm hover:bg-[#162d4a] transition-colors mb-3 rounded">
            Add to Bag
          </button>

          {product.shippingDetails && (
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
                    {product.shippingDetails}
                  </p>
                  <p className="text-xs text-blue-500 underline pb-4 cursor-pointer">
                    Shipping &amp; Return Details
                  </p>
                </>
              )}
            </div>
          )}

          {product.productDetails && (
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
                  {product.productDetails}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Carousel ── */}
        <div className="flex-1 flex flex-col justify-start pt-16 overflow-hidden relative">
          <div
            style={{
              width: `${CAROUSEL_WIDTH}px`,
              height: `${CAROUSEL_HEIGHT}px`,
              position: "relative",
              marginLeft: `${CAROUSEL_LEFT}px`,
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
                transform: `translateX(calc(-${imageIndex} * ${SLIDE_WIDTH + GAP}px))`,
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
                    borderRadius: i === imageIndex ? "16px 0 0 8px" : "0",
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

          {/* Arrows + counter */}
          <div
            style={{
              position: "absolute",
              left: `${CAROUSEL_LEFT + CAROUSEL_WIDTH}px`,
              top: `${50 + CAROUSEL_HEIGHT}px`,
              transform: "translateX(-50%)",
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
              {imageIndex + 1} / {total}
            </span>
            <button onClick={next} className="hover:opacity-60 transition text-black">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Features Section ── */}
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