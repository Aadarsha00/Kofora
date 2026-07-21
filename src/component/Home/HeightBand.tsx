import { SiteImageMap } from "@/lib/siteImages"
import TaxonomyRail from "./TaxonomyRail"

export default function HeightBand({ images }: { images?: SiteImageMap }) {
  return <TaxonomyRail kind="height" images={images} />
}
