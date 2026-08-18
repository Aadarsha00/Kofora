"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/axios/api.axios";
import type { BogoOffer } from "@/lib/bogo";

/** Raw shape returned by GET /discounts/offers/. */
interface ApiOffer {
  id: number;
  name: string;
  discount_type: string;
  buy_quantity: number | null;
  get_quantity: number | null;
  reward_percentage: string;
  max_applications: number | null;
  minimum_order_amount: string;
  is_stackable: boolean;
  starts_at: string | null;
  expires_at: string | null;
  eligible_product_ids: number[];
  eligible_category_ids: number[];
  reward_product_ids: number[];
  reward_category_ids: number[];
}

function toOffer(offer: ApiOffer): BogoOffer | null {
  if (!offer.buy_quantity || !offer.get_quantity) return null;

  return {
    id: offer.id,
    name: offer.name,
    buyQuantity: offer.buy_quantity,
    getQuantity: offer.get_quantity,
    rewardPercentage: Number(offer.reward_percentage) || 100,
    maxApplications: offer.max_applications,
    minimumOrderAmount: Number(offer.minimum_order_amount) || 0,
    eligibleScope: {
      productIds: offer.eligible_product_ids,
      categoryIds: offer.eligible_category_ids,
    },
    rewardScope: {
      productIds: offer.reward_product_ids,
      categoryIds: offer.reward_category_ids,
    },
  };
}

/**
 * Auto-applied buy-X-get-Y offers currently running.
 *
 * Used to price guest carts in the browser and to badge products. Signed-in
 * carts are priced by the server, which is always the authority.
 */
export function useActiveOffers() {
  const query = useQuery({
    queryKey: ["active-offers"],
    queryFn: async (): Promise<BogoOffer[]> => {
      const response = await api.get<{ data: ApiOffer[] }>("/discounts/offers/");
      const offers = response.data?.data ?? [];
      return offers.map(toOffer).filter((offer): offer is BogoOffer => offer !== null);
    },
    staleTime: 5 * 60 * 1000,
    // A promotions outage must never block the cart from rendering.
    retry: 1,
  });

  return { offers: query.data ?? [], isLoading: query.isLoading };
}
