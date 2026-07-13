// Every image on the landing page has a stable `imageKey`. The path stored in
// `image` is the bundled fallback; uploading an image for that key in
// Admin → Images overrides it (see src/lib/siteImages.ts).

export const CATEGORY_BANNERS = [
  { label: "WOMEN'S", image: "/women-home.webp", href: "/collections/women", imageKey: "home-tile-women" },
  { label: "MEN'S",   image: "/men-home.jpg",   href: "/collections/men",   imageKey: "home-tile-men" },
  { label: "KID'S",   image: "/kids-home.webp",   href: "/collections/kids",  imageKey: "home-tile-kids" },
]

export const HERO_DATA = {
  title: "BETTER FEEL EVERY STEPS",
  subtitle: "Premium Comfort guaranteed for life",
  image: "/banner-home.jpg",
  imageKey: "home-hero",
  ctas: [
    { label: "SHOP MEN",   href: "/collections/men"   },
    { label: "SHOP WOMEN", href: "/collections/women" },
  ],
}

export const FOOT_BANNER_DATA = {
  image: "/cta-home.jpg",
  imageKey: "home-bottom-banner",
  title: "Their New Favorites",
  subtitle: "Vibrant colors and quirky patterns that turn socks into their new favorite toys.",
}

export const FOOT_PRODUCT_GRID = [
  { id: 1, image: "/women3.webp", subtitle: "Comfort Beyond Socks", title: "SOCKS", href: "/collections/socks", imageKey: "home-grid-socks" },
  { id: 2, image: "/women1.webp", subtitle: "Comfort Beyond Socks", title: "Best Seller", href: "/collections/socks?sort_by=best-selling", imageKey: "home-grid-best-seller" },
  { id: 3, image: "/women2.webp", subtitle: "Comfort Beyond Socks", title: "New Release", href: "/collections/socks?sort_by=newest", imageKey: "home-grid-new-release" },
]

export const STYLE_CATEGORIES = [
  { label: "No Show",      image: "/no-show-home.webp", href: "/collections/no-show",      imageKey: "home-style-no-show" },
  { label: "Crew", image: "/crew-home.webp", href: "/collections/crew", imageKey: "home-style-crew" },
  { label: "Quarter",      image: "/quarter-home.webp", href: "/collections/quarter",      imageKey: "home-style-quarter" },
  { label: "Over the Calf",      image: "/over-the-calf-home.webp", href: "/collections/over-the-calf",      imageKey: "home-style-over-the-calf" },
]

// ---------------------------------------------------------------------------
// Registry of every landing-page image slot, grouped by section in the order
// the sections appear on the page (top -> bottom). Derived from the data
// above so the admin Images page always matches what the homepage renders.
// ---------------------------------------------------------------------------

export interface HomeImageSlot {
  key: string;
  label: string;
  fallback: string;
}

export interface HomeImageSection {
  title: string;
  description: string;
  slots: HomeImageSlot[];
}

export const HOME_IMAGE_SECTIONS: HomeImageSection[] = [
  {
    title: "Top Category Tiles",
    description: "The three Women / Men / Kids tiles at the very top of the homepage.",
    slots: CATEGORY_BANNERS.map((banner) => ({
      key: banner.imageKey,
      label: banner.label,
      fallback: banner.image,
    })),
  },
  {
    title: "Main Hero Banner",
    description: "The full-width banner below the tiles, with the headline and shop buttons.",
    slots: [{ key: HERO_DATA.imageKey, label: "Hero Banner", fallback: HERO_DATA.image }],
  },
  {
    title: "Shop by Style",
    description: "The four square style tiles in the middle of the homepage.",
    slots: STYLE_CATEGORIES.map((style) => ({
      key: style.imageKey,
      label: style.label,
      fallback: style.image,
    })),
  },
  {
    title: "Bottom Banner",
    description: `The large "${FOOT_BANNER_DATA.title}" banner near the bottom of the homepage.`,
    slots: [
      {
        key: FOOT_BANNER_DATA.imageKey,
        label: FOOT_BANNER_DATA.title,
        fallback: FOOT_BANNER_DATA.image,
      },
    ],
  },
  {
    title: "Bottom Product Grid",
    description: "The three linked tiles at the very bottom of the homepage.",
    slots: FOOT_PRODUCT_GRID.map((item) => ({
      key: item.imageKey,
      label: item.title,
      fallback: item.image,
    })),
  },
]
