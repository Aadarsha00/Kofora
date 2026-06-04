export const CATEGORY_BANNERS = [
  { label: "WOMEN'S", image: "/women.webp", href: "/collections/women" },
  { label: "MEN'S",   image: "/men.webp",   href: "/collections/men"   },
  { label: "KID'S",   image: "/kid.webp",   href: "/collections/kids"  },
]

export const HERO_DATA = {
  title: "BETTER FEEL EVERY STEPS",
  subtitle: "Premium Comfort guaranteed for life",
  image: "/hero.webp",
  ctas: [
    { label: "SHOP MEN",   href: "/collections/men"   },
    { label: "SHOP WOMEN", href: "/collections/women" },
  ],
}

export const FOOT_BANNER_DATA = {
  image: "/foot.webp",
  title: "Their New Favorites",
  subtitle: "Vibrant colors and quirky patterns that turn socks into their new favorite toys.",
}

export const FOOT_PRODUCT_GRID = [
  { id: 1, image: "/women3.webp", subtitle: "Comfort Beyond Socks", title: "SOCKS", href: "/collections/socks" },
  { id: 2, image: "/women1.webp", subtitle: "Comfort Beyond Socks", title: "Best Seller", href: "/collections/socks?sort_by=best-selling" },
  { id: 3, image: "/women2.webp", subtitle: "Comfort Beyond Socks", title: "New Release", href: "/collections/socks?sort_by=newest" },
]

export const SOCK_LENGTHS = [
  { label: "No Show",   image: "/socks1.webp", slug: "no-show"   },
  { label: "Ankle",     image: "/socks2.webp", slug: "ankle"     },
  { label: "Quarter",   image: "/socks3.webp", slug: "quarter"   },
  { label: "Half Calf", image: "/socks5.webp", slug: "half-calf" },
  { label: "Calf",      image: "/socks5.webp", slug: "calf"      },
  { label: "Knee High", image: "/socks4.webp", slug: "knee-high" },
  { label: "Crew Socks", image: "/socks4.webp", slug: "crew-socks" },
]

export const SOCK_CATEGORIES = [
  { label: "Women", href: (slug: string) => `/collections/women?height=${slug}` },
  { label: "Men",   href: (slug: string) => `/collections/men?height=${slug}`   },
  { label: "All",   href: (slug: string) => `/collections/socks?height=${slug}` },
]

export const STYLE_CATEGORIES = [
  { label: "Casual",      image: "/socks2.webp", href: "/collections/casual"      },
  { label: "Compression", image: "/socks4.webp", href: "/collections/compression" },
  { label: "Formal",      image: "/socks3.webp", href: "/collections/formal"      },
  { label: "Sports",      image: "/socks1.webp", href: "/collections/sports"      },
]
