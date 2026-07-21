import { SiteImageMap } from "@/lib/siteImages"
import TaxonomyRail from "./TaxonomyRail"

export default function StyleBand({ images }: { images?: SiteImageMap }) {
  return <TaxonomyRail kind="collection" images={images} />
}
