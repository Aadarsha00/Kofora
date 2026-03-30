export interface ColorVariant {
  color: string;
  images: string[];
  label: string;
}
 
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  packSavings?: string;
  category: string;
  weight: string;
  colors: ColorVariant[];
}