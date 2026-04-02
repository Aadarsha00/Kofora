import { SockHeight } from "@/data/ProductsData";

export interface ColorVariant {
  color: string;
  images: string[];
  label: string;
}
export interface Product {
  id: number;
  slug: string;
  gender: "women" | "men" | "kids";
  name: string;
  price: number;
  originalPrice?: number;
  packSavings?: string;
  category?: string;
  weight?: string;
  sizes?: number[];
  height: SockHeight
  shippingDetails?: string;
  productDetails?: string;
  colors: {
    label: string;
    color: string;
    images: string[];
  }[];
  tagline?: string;
features?: {
  image: string;
  title: string;
  description: string;
}[];
}