"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/**
 * Centered popup used by the product detail page for the "Shipping & Return"
 * and "Product & Material" panels.
 *
 * Portalled to <body> because both the quick-view panel and the desktop detail
 * column carry CSS transforms, and a transformed ancestor becomes the
 * containing block for `position: fixed` children. Landing last in <body> also
 * puts it above the quick-view modal without leaving the z-50 overlay tier.
 */
export default function InfoModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const [visible, setVisible] = useState(false);

  // Enter animation + scroll lock. Depends only on `open` so it does not
  // re-run when callers pass a fresh inline `onClose` on every render.
  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => setVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      setVisible(false);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Keep the quick-view modal underneath open.
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 sm:items-center sm:p-6"
      style={{ backgroundColor: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)" }}
      onClick={(event) => {
        // Don't let the click reach the quick-view backdrop behind us.
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-2xl bg-white text-black shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] transition-all duration-200 ease-out sm:rounded-2xl ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-6 border-b border-gray-200 px-6 py-5 sm:px-8">
          <h2 id={titleId} className="text-lg font-bold leading-tight text-black sm:text-xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 shrink-0 cursor-pointer p-1 text-black transition-opacity hover:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>,
    document.body
  );
}
