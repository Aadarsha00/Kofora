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
  { id: 2, image: "/women1.webp", subtitle: "Comfort Beyond Socks", title: "Best Seller", href: "/collections/women?sort_by=best-selling" },
  { id: 3, image: "/women2.webp", subtitle: "Comfort Beyond Socks", title: "New Release", href: "/collections/men?sort_by=best-selling" },
]

export const PRODUCT_GRID_ITEMS = [
  { id: 1, image: "/socks1.webp", name: "No Show Sock",   href: "/collections/women" },
  { id: 2, image: "/socks2.webp", name: "Ankle Sock",     href: "/collections/women" },
  { id: 3, image: "/socks3.webp", name: "Quarter Sock",   href: "/collections/men"   },
  { id: 4, image: "/socks5.webp", name: "Half Calf Sock", href: "/collections/men"   },
]

export const SOCK_LENGTHS = [
  { label: "No Show",   image: "/socks1.webp", slug: "no-show"   },
  { label: "Ankle",     image: "/socks2.webp", slug: "ankel"     },
  { label: "Quarter",   image: "/socks3.webp", slug: "quarter"   },
  { label: "Half Calf", image: "/socks5.webp", slug: "half-calf" },
  { label: "Calf",      image: "/socks5.webp", slug: "calf"      },
  { label: "Knee High", image: "/socks4.webp", slug: "knee-high" },
  { label: "Crew Socks", image: "/socks4.webp", slug: "crew-socks" },
]

export const SOCK_CATEGORIES = [
  { label: "Women", href: (slug: string) => `/collections/women?sub_category=${slug}` },
  { label: "Men",   href: (slug: string) => `/collections/men?sub_category=${slug}`   },
  { label: "All",   href: (slug: string) => `/collections/socks?sub_category=${slug}` },
]
