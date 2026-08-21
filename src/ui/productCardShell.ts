/**
 * The shared shell of our product card: the outer stack and the square media
 * block. Anything that has to sit in a product row (the collab card, for
 * example) uses these so the cards can't drift apart.
 */
export const PRODUCT_CARD_SHELL =
  "flex min-w-0 flex-col gap-2 rounded-2xl transition-all duration-300 md:gap-2.5";

export const PRODUCT_CARD_SHELL_RESTING = "bg-transparent p-0 m-0";

export const PRODUCT_CARD_MEDIA =
  "relative block w-full overflow-hidden rounded-lg bg-[#EFEFEF] md:rounded-xl";

export const PRODUCT_CARD_MEDIA_STYLE = { aspectRatio: "1 / 1" } as const;

export const PRODUCT_CARD_TEXT = "flex flex-col gap-0.5 px-0.5";

export const PRODUCT_CARD_TITLE =
  "font-semibold text-[13px] leading-snug text-black md:text-[14px]";
