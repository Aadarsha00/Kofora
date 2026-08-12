"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeSlash, FacebookLogo, X } from "@phosphor-icons/react";
import Link from "next/link";
import { LoginInput, loginSchema } from "@/schema/auth.schema";
import { AuthResponse } from "@/interface/auth";
import { useMergeGuestCart, useForceRefetchCart } from "@/hooks/useCart";
import { useGoogleLogin, useLogin } from "@/hooks/useAuthMutations";
import { useAuth } from "@/context/AuthContext";
import { useGuestCartStore } from "@/store/guestCartStore";
import { useCartSidebarStore } from "@/store/cartSidebarStore";
import { useGuestDiscount } from "@/hooks/useGuestDiscount";
import { applyFirstOrderClaim } from "@/api/discount.api";
import GoogleSignInButton from "@/component/Auth/GoogleSignInButton";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

type GuestCartItems = ReturnType<typeof useGuestCartStore.getState>["items"];

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
  const googleLoginMutation = useGoogleLogin();
  const { setAuthUser } = useAuth();
  const loadGuestCart = useGuestCartStore((state) => state.loadFromStorage);
  const openCart = useCartSidebarStore((state) => state.openCart);
  const { getGuestDiscount, clearGuestDiscount } = useGuestDiscount();

  const finishAuthenticatedLogin = useCallback(
    async (data: AuthResponse, guestItemsAtSubmit: GuestCartItems) => {
      const userToSet = data.data?.user ?? null;
      setAuthUser(userToSet);

      const guestDiscount = getGuestDiscount();
      if (guestDiscount && guestDiscount.email !== userToSet?.email) {
        clearGuestDiscount();
      }

      try {
        const latestGuestItems = useGuestCartStore.getState().items;
        const mergeResult = await mergeGuestCart.mutateAsync(latestGuestItems);
        if (mergeResult?.skipped_variant_ids?.length) {
          setApiError("Some bag items could not be moved because they are out of stock or unavailable.");
        }
      } catch (error) {
        console.error("[LoginModal] Guest cart merge failed:", error);
      }

      if (guestDiscount && guestDiscount.email === userToSet?.email) {
        try {
          await applyFirstOrderClaim(guestDiscount.claimToken);
          clearGuestDiscount();
        } catch (error) {
          clearGuestDiscount();
          setApiError(getErrorMessage(error));
        }
      }

      try {
        await forceRefetchCart();
      } catch (error) {
        console.error("[LoginModal] Cart refresh failed:", error);
      }

      if (useGuestCartStore.getState().items.length > 0) {
        return;
      }

      if (guestItemsAtSubmit.length > 0) {
        openCart();
      }

      onClose();
    },
    [clearGuestDiscount, forceRefetchCart, getGuestDiscount, mergeGuestCart, onClose, openCart, setAuthUser]
  );

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

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data: AuthResponse) => {
          void finishAuthenticatedLogin(data, guestItemsAtSubmit);
        },
        onError: (error: unknown) => {
          setApiError(getErrorMessage(error));
        },
      }
    );
  };

  const handleGoogleCredential = useCallback(
    (credential: string) => {
      setApiError(null);
      loadGuestCart();
      const guestItemsAtSubmit = useGuestCartStore.getState().items;

      googleLoginMutation.mutate(credential, {
        onSuccess: (data: AuthResponse) => {
          void finishAuthenticatedLogin(data, guestItemsAtSubmit);
        },
        onError: (error: unknown) => {
          setApiError(getErrorMessage(error));
        },
      });
    },
    [finishAuthenticatedLogin, googleLoginMutation, loadGuestCart]
  );

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

  const isAuthPending = loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-[480px] rounded-2xl p-8 relative text-black"
        onClick={(event) => event.stopPropagation()}
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
            onChange={(event) => {
              setEmail(event.target.value);
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
              onChange={(event) => {
                setPassword(event.target.value);
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
          disabled={isAuthPending}
          className="w-full h-11 bg-[#253E38] text-white text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity cursor-pointer rounded-sm disabled:opacity-60"
        >
          {loginMutation.isPending ? "Logging in..." : "Log In"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mb-3">
          <GoogleSignInButton
            disabled={isAuthPending}
            onCredential={handleGoogleCredential}
            onError={setApiError}
          />
        </div>

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
