import { useMemo } from "react";
import { useGuestDiscount } from "./useGuestDiscount";

interface CartItem {
  price: number;
  quantity: number;
}

export const useGuestCartCalculations = (items: CartItem[]) => {
  const { getGuestDiscount } = useGuestDiscount();
  
  const calculations = useMemo(() => {
    const discount = getGuestDiscount();
    
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discount) {
      if (discount.discountType === "percent") {
        discountAmount = subtotal * (discount.discountAmount / 100);
      } else {
        discountAmount = Math.min(discount.discountAmount, subtotal);
      }
    }
    
    const total = subtotal - discountAmount;
    
    return {
      subtotal,
      discountAmount,
      total,
      appliedDiscount: discount,
    };
  }, [items, getGuestDiscount]);
  
  return calculations;
};
