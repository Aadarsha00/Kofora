import { Product } from "@/interface/Product";

/**
 * The homepage collab row is the collection card plus this many products, so
 * both the storefront band and the admin product picker agree on which of a
 * collab's products actually make the row.
 */
export const COLLAB_ROW_PRODUCT_COUNT = 4;

/** The products the homepage row shows, in the order the API returns them. */
export function collabRowProducts(products: Product[] | undefined): Product[] {
  return (products ?? [])
    .filter((product) => product.is_active && product.is_published)
    .slice(0, COLLAB_ROW_PRODUCT_COUNT);
}
