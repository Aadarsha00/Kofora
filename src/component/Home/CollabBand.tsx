import { Category } from "@/interface/Category"
import { CollabDetail } from "@/interface/Collab"
import { collabRowProducts } from "@/lib/collabs"
import { getProductGender } from "@/lib/searchHelpers"
import CollabCard from "@/ui/CollabCard"
import ProductCard from "@/ui/ProductCard"
import type { CSSProperties } from "react"

/**
 * Partner collection (e.g. "Kofora x Marvel"), sitting between the comfort
 * promise and New Arrivals.
 *
 * Unlike the New Arrivals rows there is no title column — the collab's own
 * picture card carries the name and the shop button, so it takes the leftmost
 * slot and the row runs the full width of the page from there.
 */
export default function CollabBand({
  collabs,
  categories,
}: {
  collabs: CollabDetail[] | null
  categories: Category[]
}) {
  const featured = (collabs ?? [])
    .filter((collab) => collab.is_live && collab.show_on_homepage)
    .sort((a, b) => a.sort_order - b.sort_order)

  if (featured.length === 0) return null

  return (
    <div className="w-full bg-white">
      {featured.map((collab) => {
        // Collab card + four products = one full-width row. The rest of the
        // drop lives on the collab's own page.
        const products = collabRowProducts(collab.products)

        return (
          <section
            key={collab.id}
            aria-label={`${collab.name} collection`}
            className="px-4 py-12 md:px-14 md:py-16"
            style={
              {
                "--collab-accent": collab.accent_color,
                "--collab-text": collab.text_color,
              } as CSSProperties
            }
          >
            {/* Two-up on phones; from md the collab card leads and the four
                products follow it across the full width. */}
            <div className="grid w-full min-w-0 grid-cols-2 gap-4 md:grid-cols-5">
              <div className="min-w-0">
                <CollabCard collab={collab} />
              </div>

              {products.map((product) => (
                <div key={product.id} className="min-w-0">
                  <ProductCard
                    product={product}
                    gender={getProductGender(product, categories)}
                  />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
