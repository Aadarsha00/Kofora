// Backend-managed homepage tiles use these images only until an admin uploads
// a replacement for the seeded Women, Men, Kids, or Teens record.
export const DEFAULT_HOMEPAGE_TILES = [
  { key: "women", title: "Women", href: "/collections/women", image: "/women-hero.jpg" },
  { key: "men", title: "Men", href: "/collections/men", image: "/men-hero.webp" },
  { key: "kids", title: "Kids", href: "/collections/kids", image: "/kids-hero.webp" },
  // No bundled Teens photo yet — falls back to the generic sock hero until an
  // admin uploads one from the Homepage Tiles screen.
  { key: "teens", title: "Teens", href: "/collections/teens", image: "/socks-hero.webp" },
]

// Fixed landing-page sections use stable image keys. Admin image uploads
// override the bundled fallback paths through src/lib/siteImages.ts.
// Two-panel hero from md up: the left panel is photography only, the right
// panel is a flat colour block carrying the headline, body copy and shop
// buttons. On mobile the two merge — the copy sits on top of the photo.
export const HERO_DATA = {
  title: "BETTER FEEL. EVERY STEP.",
  titleLines: ["BETTER FEEL.", "EVERY STEP."],
  subtitle: "Premium comfort, guaranteed for life.",
  image: "/home-hero-family.jpg",
  imageKey: "home-hero",
  panelColor: "#253E38",
  ctas: [
    { label: "SHOP MEN",   href: "/collections/men"   },
    { label: "SHOP WOMEN", href: "/collections/women" },
  ],
}

// Renders as an animated wave band rather than a photo, so it carries no image.
export const FOOT_BANNER_DATA = {
  title: "Their New Favorites",
  subtitle: "Vibrant colors and quirky patterns that turn socks into their new favorite toys.",
  cta: { label: "Shop Kids", href: "/collections/kids" },
}

export const FOOT_PRODUCT_GRID = [
  { id: 1, image: "/women3.webp", subtitle: "Comfort Beyond Socks", title: "SOCKS", href: "/collections/socks", imageKey: "home-grid-socks" },
  { id: 2, image: "/caps-hero.jpg", subtitle: "Finish The Look", title: "CAPS", href: "/collections/caps", imageKey: "home-grid-caps" },
  { id: 3, image: "/women2.webp", subtitle: "The Pairs People Love", title: "BEST SELLERS", href: "/collections/socks?sort_by=best-selling", imageKey: "home-grid-best-seller" },
]

export const COLLECTION_CATEGORIES = [
  { slug: "casual", label: "Casual", image: "/women-home.webp", imageKey: "home-collection-casual" },
  { slug: "sport", label: "Sport", image: "/quarter.webp", imageKey: "home-collection-sport" },
  { slug: "compression", label: "Compression", image: "/women2.webp", imageKey: "home-collection-compression" },
  { slug: "grippers", label: "Grippers", image: "/kids-home.webp", imageKey: "home-collection-grippers" },
  { slug: "dressy", label: "Dressy", image: "/men-home.jpg", imageKey: "home-collection-dressy" },
  { slug: "cozy", label: "Cozy", image: "/crew-home.webp", imageKey: "home-collection-cozy" },
]

export const HEIGHT_CATEGORIES = [
  { slug: "no-show", label: "No Show", image: "/no-show-home.webp", imageKey: "home-height-no-show" },
  { slug: "ankle", label: "Ankle", image: "/women-home.webp", imageKey: "home-height-ankle" },
  { slug: "quarter", label: "Quarter", image: "/quarter-home.webp", imageKey: "home-height-quarter" },
  { slug: "half-calf", label: "Half Calf", image: "/men-home.jpg", imageKey: "home-height-half-calf" },
  { slug: "calf", label: "Calf", image: "/crew-home.webp", imageKey: "home-height-calf" },
  { slug: "knee-high", label: "Knee High", image: "/over-the-calf-home.webp", imageKey: "home-height-knee-high" },
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
    title: "Main Hero Banner",
    description: "The two-panel banner below the tiles. Only the left panel uses a photo — the right panel is a flat colour block with the headline and shop buttons. On mobile the copy sits on top of the photo, so pick one that stays readable under white text.",
    slots: [{ key: HERO_DATA.imageKey, label: "Hero Photo (left panel)", fallback: HERO_DATA.image }],
  },
  {
    title: "Shop by Collection",
    description: "The collection rail below the main campaign banner.",
    slots: COLLECTION_CATEGORIES.map((collection) => ({
      key: collection.imageKey,
      label: collection.label,
      fallback: collection.image,
    })),
  },
  {
    title: "Shop by Height",
    description: "The sock-height rail below the product rows.",
    slots: HEIGHT_CATEGORIES.map((height) => ({
      key: height.imageKey,
      label: height.label,
      fallback: height.image,
    })),
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
