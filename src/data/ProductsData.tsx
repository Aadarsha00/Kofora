import { Product } from "@/interface/Product";
export const WOMENS_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Women's Friday Clog",
    price: 10400,
    category: "Women",
    weight: "Midweight",
    colors: [
      { color: "#C49A8A", label: "Blush",  images: ["/socks1.webp",  "/socks2.webp"]  },
      { color: "#4A5E4A", label: "Forest", images: ["/socks3.webp", "/socks4.webp"] },
      { color: "#E8E4DC", label: "Cream",  images: ["/images/clog-cream-1.jpg",  "/images/clog-cream-2.jpg"]  },
      { color: "#1A1A1A", label: "Black",  images: ["/images/clog-black-1.jpg",  "/images/clog-black-2.jpg"]  },
    ],
  },
  {
    id: 2,
    name: "Garden Party Ankle Sock 4-Pack",
    price: 8700,
    originalPrice: 10100,
    packSavings: "13% Pack Savings",
    category: "Women",
    weight: "Midweight",
    colors: [
      { color: "#D4C5A9", label: "Sand", images: ["/images/sock-sand-1.jpg", "/images/sock-sand-2.jpg"] },
      { color: "#7B9BB2", label: "Blue", images: ["/images/sock-blue-1.jpg", "/images/sock-blue-2.jpg"] },
    ],
  },
  {
    id: 3,
    name: "Studio Gripper Quarter Socks",
    price: 3700,
    category: "Women",
    weight: "Lightweight",
    colors: [
      { color: "#FFFFFF", label: "White", images: ["/images/grip-white-1.jpg", "/images/grip-white-2.jpg"] },
      { color: "#B8C9D9", label: "Sky",   images: ["/images/grip-sky-1.jpg",   "/images/grip-sky-2.jpg"]   },
      { color: "#C4A882", label: "Tan",   images: ["/images/grip-tan-1.jpg",   "/images/grip-tan-2.jpg"]   },
    ],
  },
  {
    id: 4,
    name: "Vintage Stripes Half Calf Sock 4-Pack",
    price: 9600,
    originalPrice: 10400,
    packSavings: "8% Pack Savings",
    category: "Women",
    weight: "Midweight",
    colors: [
      { color: "#8FAF8F", label: "Sage", images: ["/images/stripe-sage-1.jpg", "/images/stripe-sage-2.jpg"] },
      { color: "#2C3E6B", label: "Navy", images: ["/images/stripe-navy-1.jpg", "/images/stripe-navy-2.jpg"] },
    ],
  },
];

export const MENS_PRODUCTS: Product[] = [
  {
    id: 5,
    name: "Men's Friday Slide",
    price: 8700,
    category: "Men",
    weight: "Midweight",
    colors: [
      { color: "#2C3E6B", label: "Navy",  images: ["/images/slide-navy-1.jpg",  "/images/slide-navy-2.jpg"]  },
      { color: "#8B9BAA", label: "Slate", images: ["/images/slide-slate-1.jpg", "/images/slide-slate-2.jpg"] },
      { color: "#7D6E5E", label: "Mocha", images: ["/images/slide-mocha-1.jpg", "/images/slide-mocha-2.jpg"] },
      { color: "#1A1A1A", label: "Black", images: ["/images/slide-black-1.jpg", "/images/slide-black-2.jpg"] },
    ],
  },
  {
    id: 6,
    name: "Everyday Compression Knee High Sock 3-Pack",
    price: 3500,
    originalPrice: 4000,
    packSavings: "12.5% Pack Savings",
    category: "Men",
    weight: "Midweight",
    colors: [
      { color: "#1A1A1A", label: "Black", images: ["/images/knee-black-1.jpg", "/images/knee-black-2.jpg"] },
      { color: "#2C3E6B", label: "Navy",  images: ["/images/knee-navy-1.jpg",  "/images/knee-navy-2.jpg"]  },
      { color: "#8B2020", label: "Red",   images: ["/images/knee-red-1.jpg",   "/images/knee-red-2.jpg"]   },
    ],
  },
  {
    id: 7,
    name: "All-Day Cushion Ankle Sock 4-Pack",
    price: 7200,
    category: "Men",
    weight: "Lightweight",
    colors: [
      { color: "#4A5E4A", label: "Forest", images: ["/images/ankle-forest-1.jpg", "/images/ankle-forest-2.jpg"] },
      { color: "#C4A882", label: "Tan",    images: ["/images/ankle-tan-1.jpg",    "/images/ankle-tan-2.jpg"]    },
    ],
  },
  {
    id: 8,
    name: "Performance Running No-Show 3-Pack",
    price: 6500,
    originalPrice: 7500,
    packSavings: "10% Pack Savings",
    category: "Men",
    weight: "Lightweight",
    colors: [
      { color: "#FFFFFF", label: "White", images: ["/images/run-white-1.jpg", "/images/run-white-2.jpg"] },
      { color: "#1A1A1A", label: "Black", images: ["/images/run-black-1.jpg", "/images/run-black-2.jpg"] },
      { color: "#8B9BAA", label: "Slate", images: ["/images/run-slate-1.jpg", "/images/run-slate-2.jpg"] },
    ],
  },
];