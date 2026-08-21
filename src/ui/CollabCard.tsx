import { Collab } from "@/interface/Collab";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  PRODUCT_CARD_MEDIA,
  PRODUCT_CARD_MEDIA_STYLE,
  PRODUCT_CARD_SHELL,
  PRODUCT_CARD_SHELL_RESTING,
  PRODUCT_CARD_TEXT,
  PRODUCT_CARD_TITLE,
} from "./productCardShell";

/**
 * The collab's own card, sitting in a product row alongside ProductCard. It is
 * built from the same shell — same stack, same square media block, same text
 * row — so it lines up exactly with the product cards beside it. What's inside
 * the media block is the uploaded picture and a shop button, not a carousel.
 */
export default function CollabCard({ collab }: { collab: Collab }) {
  const href = `/collabs/${collab.slug}`;

  return (
    <div
      className={`${PRODUCT_CARD_SHELL} ${PRODUCT_CARD_SHELL_RESTING}`}
      style={
        {
          "--collab-accent": collab.accent_color,
          "--collab-text": collab.text_color,
        } as CSSProperties
      }
    >
      <Link
        href={href}
        aria-label={`Shop the ${collab.name} collection`}
        className={`group ${PRODUCT_CARD_MEDIA} bg-[var(--collab-accent)]`}
        style={PRODUCT_CARD_MEDIA_STYLE}
      >
        {collab.banner_image && (
          <>
            <Image
              src={collab.banner_image}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            {/* Scrim only when there's a photo behind the type. */}
            <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
          </>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-[var(--collab-text)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85">
            {collab.partner_name ? `Kofora × ${collab.partner_name}` : "Limited collection"}
          </p>

          {collab.logo ? (
            <Image
              src={collab.logo}
              alt={collab.name}
              width={280}
              height={90}
              className="h-auto w-auto max-h-14 max-w-[80%] object-contain"
            />
          ) : (
            <h2 className="text-xl font-black uppercase leading-[0.95] tracking-[-0.02em] md:text-2xl">
              {collab.name}
            </h2>
          )}

          <span className="mt-1 inline-flex h-10 items-center justify-center rounded-md bg-white px-5 text-xs font-extrabold uppercase tracking-wide text-[#1a1a1a] transition-[border-radius,background-color] duration-300 ease-[cubic-bezier(0,0.5,0.5,1)] group-hover:rounded-[calc(0.375rem+6px)] group-hover:bg-white/90">
            {collab.cta_label}
          </span>
        </div>
      </Link>

      {/* Mirrors the product card's text row so the card is the same height. */}
      <Link href={href} className={PRODUCT_CARD_TEXT}>
        <p className={PRODUCT_CARD_TITLE}>{collab.name}</p>
        <span className="text-[13px] font-bold text-black md:text-[14px]">
          {collab.product_count} {collab.product_count === 1 ? "style" : "styles"}
        </span>
      </Link>
    </div>
  );
}
