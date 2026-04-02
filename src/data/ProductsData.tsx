import { Product } from "@/interface/Product";

export type SockHeight = "No-Show" | "Ankle" | "Quarter" | "Crew" | "Half-Calf" | "Knee-High" | "Calf";

export const WOMENS_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "friday-clog",
    gender: "women",
    name: "Women's Friday Clog",
    price: 10400,
    category: "Women",
    height: "Ankle",
    weight: "Midweight",
    sizes: [5, 6, 7, 8, 9, 10, 11],
    shippingDetails: "Free returns within 60 days. International shipping available to select countries.",
    productDetails: "Ultra-light EVA construction tuned just right. Not too hard, not too soft. Built-in air vents for breathability and a ribbed cupped footbed for stay-put comfort.",
    colors: [
      { color: "#C49A8A", label: "Blush", images: ["/socks1.webp", "/socks2.webp"] },
      { color: "#4A5E4A", label: "Forest", images: ["/socks3.webp", "/socks5.webp"] },
      { color: "#E8E4DC", label: "Cream", images: ["/images/clog-cream-1.jpg", "/images/clog-cream-2.jpg"] },
      { color: "#1A1A1A", label: "Black", images: ["/images/clog-black-1.jpg", "/images/clog-black-2.jpg"] },
    ],
    tagline: "A Modern Take on a Classic Clog",
    features: [
      { image: "/socks1.webp", title: "Cushy Support", description: "Ultra-light EVA, tuned just right." },
      { image: "/socks2.webp", title: "Waterproof Design", description: "Go wherever Friday takes you." },
      { image: "/socks3.webp", title: "Closed-Toe Airflow", description: "Built-in air vents keep it breezy." },
    ],
  },
  {
    id: 2,
    slug: "garden-party-ankle-sock-4-pack",
    gender: "women",
    name: "Garden Party Ankle Sock 4-Pack",
    price: 8700,
    originalPrice: 10100,
    packSavings: "13% Pack Savings",
    category: "Women",
    height: "Ankle",
    weight: "Midweight",
    sizes: [5, 6, 7, 8, 9, 10],
    shippingDetails: "Free returns within 60 days. International shipping available to select countries.",
    productDetails: "Garden-inspired floral pattern.",
    colors: [
      { color: "#D4C5A9", label: "Sand", images: ["/images/sock-sand-1.jpg"] },
      { color: "#7B9BB2", label: "Blue", images: ["/images/sock-blue-1.jpg"] },
    ],
    tagline: "Garden Fresh, All Day Long",
    features: [
      { image: "/images/sock-sand-1.jpg", title: "Floral Pattern", description: "Garden-inspired design." },
    ],
  },
  {
    id: 3,
    slug: "studio-gripper-quarter-socks",
    gender: "women",
    name: "Studio Gripper Quarter Socks",
    price: 3700,
    category: "Women",
    height: "Quarter",
    weight: "Lightweight",
    sizes: [5, 6, 7, 8, 9, 10],
    shippingDetails: "Free returns within 60 days.",
    productDetails: "Non-slip grip dots.",
    colors: [
      { color: "#FFFFFF", label: "White", images: ["/images/grip-white-1.jpg"] },
    ],
    tagline: "Stay Grounded",
    features: [
      { image: "/images/grip-white-1.jpg", title: "Non-Slip Grip", description: "Stay steady." },
    ],
  },
  {
    id: 4,
    slug: "vintage-stripes-half-calf-sock-4-pack",
    gender: "women",
    name: "Vintage Stripes Half Calf Sock",
    price: 9600,
    category: "Women",
    height: "Half-Calf",
    weight: "Midweight",
    sizes: [5, 6, 7, 8, 9, 10],
    shippingDetails: "Free returns within 60 days.",
    productDetails: "Retro stripes.",
    colors: [
      { color: "#8FAF8F", label: "Sage", images: ["/images/stripe-sage-1.jpg"] },
    ],
    tagline: "Retro Vibes",
    features: [
      { image: "/images/stripe-sage-1.jpg", title: "Vintage Stripe", description: "Classic look." },
    ],
  },

  // ✅ Added No-Show
  {
    id: 9,
    slug: "women-no-show",
    gender: "women",
    name: "Women's No Show Sock",
    price: 4200,
    category: "Women",
    height: "No-Show",
    weight: "Lightweight",
    sizes: [5, 6, 7, 8, 9, 10],
    shippingDetails: "Free returns.",
    productDetails: "Low-profile hidden socks.",
    colors: [{ color: "#000", label: "Black", images: ["/images/w-noshow.jpg"] }],
    tagline: "Invisible Comfort",
    features: [{ image: "/images/w-noshow.jpg", title: "Hidden Fit", description: "No-show design." }],
  },

  // ✅ Added Knee-High
  {
    id: 10,
    slug: "women-knee-high",
    gender: "women",
    name: "Women's Knee High Sock",
    price: 5200,
    category: "Women",
    height: "Knee-High",
    weight: "Midweight",
    sizes: [5, 6, 7, 8, 9, 10],
    shippingDetails: "Free returns.",
    productDetails: "Full coverage socks.",
    colors: [{ color: "#2C3E6B", label: "Navy", images: ["/images/w-knee.jpg"] }],
    tagline: "Full Coverage Comfort",
    features: [{ image: "/images/w-knee.jpg", title: "Stay Up", description: "Doesn't slip." }],
  },
   {
    id: 13,
    slug: "women-calf",
    gender: "women",
    name: "Women's Calf Sock",
    price: 5200,
    category: "Women",
    height: "Calf",
    weight: "Midweight",
    sizes: [5, 6, 7, 8, 9, 10],
    shippingDetails: "Free returns.",
    productDetails: "Full coverage socks.",
    colors: [{ color: "#2C3E6B", label: "Navy", images: ["/images/w-calf.jpg"] }],
    tagline: "Full Coverage Comfort",
    features: [{ image: "/images/w-calf.jpg", title: "Stay Up", description: "Doesn't slip." }],
  },
];

export const MENS_PRODUCTS: Product[] = [
  {
    id: 5,
    slug: "friday-slide",
    gender: "men",
    name: "Men's Friday Slide",
    price: 8700,
    category: "Men",
    height: "Ankle",
    weight: "Midweight",
    sizes: [7, 8, 9, 10, 11, 12, 13],
    shippingDetails: "Free returns.",
    productDetails: "Slide comfort.",
    colors: [{ color: "#000", label: "Black", images: ["/images/slide.jpg"] }],
    tagline: "Slide Comfort",
    features: [{ image: "/images/slide.jpg", title: "Lightweight", description: "Easy wear." }],
  },
  {
    id: 6,
    slug: "knee-high",
    gender: "men",
    name: "Men Knee High",
    price: 3500,
    category: "Men",
    height: "Knee-High",
    weight: "Midweight",
    sizes: [7, 8, 9],
    shippingDetails: "Free returns.",
    productDetails: "Compression socks.",
    colors: [{ color: "#000", label: "Black", images: ["/images/knee.jpg"] }],
    tagline: "Performance",
    features: [{ image: "/images/knee.jpg", title: "Compression", description: "Support." }],
  },
  {
    id: 7,
    slug: "ankle-sock",
    gender: "men",
    name: "Men Ankle Sock",
    price: 7200,
    category: "Men",
    height: "Ankle",
    weight: "Lightweight",
    sizes: [7, 8, 9],
    shippingDetails: "Free returns.",
    productDetails: "Daily wear.",
    colors: [{ color: "#4A5E4A", label: "Forest", images: ["/images/ankle.jpg"] }],
    tagline: "Daily Comfort",
    features: [{ image: "/images/ankle.jpg", title: "Cushion", description: "Soft." }],
  },
  {
    id: 8,
    slug: "no-show",
    gender: "men",
    name: "Men No Show",
    price: 6500,
    category: "Men",
    height: "No-Show",
    weight: "Lightweight",
    sizes: [7, 8, 9],
    shippingDetails: "Free returns.",
    productDetails: "Running socks.",
    colors: [{ color: "#fff", label: "White", images: ["/images/run.jpg"] }],
    tagline: "Run Ready",
    features: [{ image: "/images/run.jpg", title: "Lightweight", description: "Fast." }],
  },

  // ✅ Added Quarter
  {
    id: 11,
    slug: "men-quarter",
    gender: "men",
    name: "Men Quarter Sock",
    price: 4600,
    category: "Men",
    height: "Quarter",
    weight: "Lightweight",
    sizes: [7, 8, 9],
    shippingDetails: "Free returns.",
    productDetails: "Training socks.",
    colors: [{ color: "#888", label: "Grey", images: ["/images/m-quarter.jpg"] }],
    tagline: "Move Better",
    features: [{ image: "/images/m-quarter.jpg", title: "Breathable", description: "Cool." }],
  },

  // ✅ Added Half-Calf
  {
    id: 12,
    slug: "men-half-calf",
    gender: "men",
    name: "Men Half Calf Sock",
    price: 5000,
    category: "Men",
    height: "Half-Calf",
    weight: "Midweight",
    sizes: [7, 8, 9],
    shippingDetails: "Free returns.",
    productDetails: "Mid-length comfort.",
    colors: [{ color: "#000", label: "Black", images: ["/images/m-half.jpg"] }],
    tagline: "Balanced Fit",
    features: [{ image: "/images/m-half.jpg", title: "Perfect Length", description: "Just right." }],
  },
];

export const ALL_PRODUCTS: Product[] = [...WOMENS_PRODUCTS, ...MENS_PRODUCTS];

export function getAllProducts(): Product[] {
  return ALL_PRODUCTS;
}

export function getProductBySlug(gender: string, slug: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.gender === gender && p.slug === slug);
}

export function getProductsByGender(gender: string): Product[] {
  return ALL_PRODUCTS.filter((p) => p.gender === gender);
}

export function getProductsByHeight(height: SockHeight): Product[] {
  return ALL_PRODUCTS.filter((p) => p.height === height);
}