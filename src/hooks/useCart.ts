import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  getCart, addItemToCart, updateCartItem, removeCartItem,
  clearCart, applyCoupon, removeCoupon, setShippingMethod,
  setShippingAddress, setBillingAddress, mergeGuestCart,
} from "@/api/cart.api";
import { useGuestCartStore, type GuestCartItem } from "@/store/guestCartStore";
import { useAuth } from "@/context/AuthContext";

const CART_QUERY_KEY = ["cart"];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useCart = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const enabled = isAuthenticated && !authLoading;

  console.log(`[useCart] enabled=${enabled} | isAuthenticated=${isAuthenticated} | authLoading=${authLoading}`);

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      console.log("[useCart] 🔄 queryFn fired — calling getCart API");
      const result = await getCart();
      console.log("[useCart] ✅ getCart response:", JSON.stringify(result, null, 2));
      return result;
    },
    enabled,
  });
};

export const useForceRefetchCart = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    console.log("[useForceRefetchCart] 🔄 Forcing cart fetch via fetchQuery...");
    try {
      const result = await queryClient.fetchQuery({
        queryKey: CART_QUERY_KEY,
        queryFn: async () => {
          console.log("[useForceRefetchCart] queryFn fired — calling getCart API");
          const data = await getCart();
          console.log("[useForceRefetchCart] ✅ getCart response:", JSON.stringify(data, null, 2));
          return data;
        },
      });
      console.log("[useForceRefetchCart] ✅ fetchQuery resolved. Cart in cache:", queryClient.getQueryData(CART_QUERY_KEY));
      return result;
    } catch (err) {
      console.error("[useForceRefetchCart] ❌ fetchQuery failed:", err);
      throw err;
    }
  }, [queryClient]);
};

export const useClearCartCache = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    console.log("[useClearCartCache] Removing cart cache...");
    queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
    console.log("[useClearCartCache] ✅ Cart cache removed");
  }, [queryClient]);
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity?: number }) =>
      addItemToCart(variantId, quantity),
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error adding item:", error); },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error updating item:", error); },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error removing item:", error); },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error clearing cart:", error); },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponCode: string) => applyCoupon(couponCode),
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error applying coupon:", error); },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCoupon,
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error: unknown) => {
      console.error("[useRemoveCoupon] Error:", getErrorMessage(error));
    },
  });
};

export const useSetShippingMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shippingMethodId: number) => setShippingMethod(shippingMethodId),
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error setting shipping method:", error); },
  });
};

export const useSetShippingAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: number) => setShippingAddress(addressId),
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error setting shipping address:", error); },
  });
};

export const useSetBillingAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: number) => setBillingAddress(addressId),
    onSuccess: (data) => { queryClient.setQueryData(CART_QUERY_KEY, data); },
    onError: (error) => { console.error("[Cart] Error setting billing address:", error); },
  });
};

export const useCartTotals = () => {
  const { data: cart } = useCart();
  return cart?.totals ?? null;
};

export const useCartItemCount = () => {
  const { data: cart } = useCart();
  const variantCount = cart?.variant_items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const bundleCount = cart?.bundle_items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  return variantCount + bundleCount;
};

export const useIsCartEmpty = () => {
  const count = useCartItemCount();
  return count === 0;
};

export const useTotalCartItemCount = () => {
  const { isAuthenticated } = useAuth();
  const authenticatedCount = useCartItemCount();
  const guestItems = useGuestCartStore((state) => state.items);
  const guestCount = guestItems.reduce((sum, item) => sum + item.quantity, 0);
  if (!isAuthenticated) return guestCount;
  return authenticatedCount;
};

export const useMergeGuestCart = () => {
  const queryClient = useQueryClient();
  const clearGuestCart = useGuestCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: (itemsToMerge: GuestCartItem[]) => {
      console.log("[useMergeGuestCart] mutationFn called with items:", JSON.stringify(itemsToMerge));
      if (!itemsToMerge || itemsToMerge.length === 0) {
        console.log("[useMergeGuestCart] ⏭️ No guest items to merge, skipping API call");
        return Promise.resolve(null);
      }
      console.log("[useMergeGuestCart] 🔄 Calling mergeGuestCart API with", itemsToMerge.length, "items");
      return mergeGuestCart(itemsToMerge);
    },
    onSuccess: (data, itemsToMerge) => {
      console.log("[useMergeGuestCart] ✅ Merge success. Response:", JSON.stringify(data, null, 2));
      if (data) {
        queryClient.setQueryData(CART_QUERY_KEY, data);
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        const mergedVariantIds = new Set(
          data.merged_variant_ids ?? data.variant_items?.map((item) => item.variant.id) ?? []
        );
        const requestedVariantIds = new Set((itemsToMerge ?? []).map((item) => item.variantId));
        const allRequestedItemsMerged = Array.from(requestedVariantIds).every((variantId) =>
          mergedVariantIds.has(variantId)
        );

        if (allRequestedItemsMerged) {
          clearGuestCart();
          console.log("[useMergeGuestCart] Cache updated and guest cart cleared");
        } else {
          console.warn("[useMergeGuestCart] Some guest items were not merged; keeping guest cart in localStorage");
          return;
        }
        console.log("[useMergeGuestCart] ✅ Cache updated and guest cart cleared");
      } else {
        console.log("[useMergeGuestCart] ℹ️ No data returned, cache not updated");
      }
    },
    onError: (error) => {
      console.error("[useMergeGuestCart] ❌ Merge error:", error);
    },
  });
};
