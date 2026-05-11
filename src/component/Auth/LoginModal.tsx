"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeSlash, GoogleLogo, FacebookLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { LoginInput, loginSchema } from "@/schema/auth.schema";
import { AuthResponse } from "@/interface/auth";
import { useMergeGuestCart, useForceRefetchCart } from "@/hooks/useCart";
import { useLogin } from "@/hooks/useAuthMutations";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useCartSidebarStore } from "@/store/cartSidebarStore";
import { useGuestDiscount } from "@/hooks/useGuestDiscount";
import { applyFirstOrderClaim } from "@/api/discount.api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return error instanceof Error ? error.message : "Login failed. Please try again.";
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const mergeGuestCart = useMergeGuestCart();
  const forceRefetchCart = useForceRefetchCart();
  const loginMutation = useLogin();
  const { setAuthUser } = useAuth();
  const loadGuestCart = useGuestCartStore((state) => state.loadFromStorage);
  const openCart = useCartSidebarStore((state) => state.openCart);
  const { getGuestDiscount, clearGuestDiscount } = useGuestDiscount();

  const handleSubmit = () => {
    setApiError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({ email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] });
      return;
    }
    setErrors({});
    loadGuestCart();
    const guestItemsAtSubmit = useGuestCartStore.getState().items;

    console.log("[LoginModal] 🚀 Starting login flow...");
    console.log("[LoginModal] Guest items snapshot at login time:", JSON.stringify(guestItemsAtSubmit));

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (data: AuthResponse) => {
          console.log("[LoginModal] ✅ STEP 1: Login success");
          console.log("[LoginModal] Full response data:", JSON.stringify(data, null, 2));
          console.log("[LoginModal] data.data?.user:", JSON.stringify(data.data?.user));

          // STEP 1: Update auth context
          const userToSet = data.data?.user ?? null;
          console.log("[LoginModal] Setting auth user to:", userToSet?.email ?? "null (no user in response)");
          setAuthUser(userToSet);

          // VALIDATE DISCOUNT EMAIL MATCH
          const guestDiscount = getGuestDiscount();
          if (guestDiscount && guestDiscount.email !== userToSet?.email) {
            console.log("[LoginModal] ⚠️ Discount email mismatch:", guestDiscount.email, "vs login email:", userToSet?.email);
            console.log("[LoginModal] Clearing guest discount (email doesn't match)");
            clearGuestDiscount();
          } else if (guestDiscount && guestDiscount.email === userToSet?.email) {
            console.log("[LoginModal] ✅ Discount email matches login email, keeping discount active");
          }

          // STEP 2: Merge guest cart
          const latestGuestItems = useGuestCartStore.getState().items;
          console.log("[LoginModal] STEP 2: Merging guest cart with", latestGuestItems.length, "items...");
          try {
            const mergeResult = await mergeGuestCart.mutateAsync(latestGuestItems);
            console.log("[LoginModal] ✅ STEP 2 complete. Merge result:", JSON.stringify(mergeResult));
            if (mergeResult?.skipped_variant_ids?.length) {
              setApiError("Some bag items could not be moved because they are out of stock or unavailable.");
            }
            if (mergeResult?.capped_variant_ids?.length) {
              console.info("[LoginModal] Some item quantities were capped to available stock.");
            }
          } catch (error) {
            console.error("[LoginModal] ❌ STEP 2 failed (merge error):", error);
          }

          if (guestDiscount && guestDiscount.email === userToSet?.email) {
            try {
              const claimedCart = await applyFirstOrderClaim(guestDiscount.claimToken);
              console.log("[LoginModal] First-order discount applied:", JSON.stringify(claimedCart));
              clearGuestDiscount();
            } catch (error) {
              console.error("[LoginModal] First-order discount claim failed:", error);
              clearGuestDiscount();
              setApiError(getErrorMessage(error));
            }
          }

          // STEP 3: Force fetch authenticated cart
          console.log("[LoginModal] 🚀 STEP 3: Force fetching authenticated cart...");
          try {
            const cartResult = await forceRefetchCart();
            console.log("[LoginModal] ✅ STEP 3 complete. Cart items count:",
              (cartResult?.variant_items?.length ?? 0) + (cartResult?.bundle_items?.length ?? 0)
            );
            console.log("[LoginModal] ✅ STEP 3 full cart:", JSON.stringify(cartResult, null, 2));
          } catch (error) {
            console.error("[LoginModal] ❌ STEP 3 failed (cart fetch error):", error);
          }

          if (useGuestCartStore.getState().items.length > 0) {
            console.log("[LoginModal] Login flow completed with unmerged guest items; keeping modal open");
            return;
          }

          if (guestItemsAtSubmit.length > 0) {
            openCart();
          }

          console.log("[LoginModal] ✅ Login flow complete, closing modal");
          onClose();
        },
        onError: (error: unknown) => {
          console.error("[LoginModal] ❌ Login mutation error:", error);
          setApiError(getErrorMessage(error));
        },
      }
    );
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-[480px] rounded-2xl p-8 relative text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-50 transition-opacity cursor-pointer">
          <X size={20} />
        </button>

        <h2 className="text-center text-xl font-semibold mb-2">Log In</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Log in for faster checkout and access to your order history.
        </p>

        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="mb-2">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {apiError && (
          <p className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{apiError}</p>
        )}

        <div className="mb-5 mt-3">
          <Link href="/forgot-password" className="text-sm text-black underline hover:opacity-60 transition-opacity">
            Forgot Password?
          </Link>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loginMutation.isPending}
          className="w-full bg-[#253E38] text-white py-3 text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity cursor-pointer rounded-sm disabled:opacity-60"
        >
          {loginMutation.isPending ? "Logging in..." : "Log In"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button className="w-full border border-gray-300 rounded-sm py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer mb-3">
          <GoogleLogo size={18} weight="bold" color="#4285F4" />
          Continue with Google
        </button>

        <button className="w-full border border-gray-300 rounded-sm py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
          <FacebookLogo size={18} weight="bold" color="#1877F2" />
          Continue with Facebook
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t Have An Account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="font-semibold text-black underline hover:opacity-60 transition-opacity cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
