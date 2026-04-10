"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Eye, GoogleLogo, FacebookLogo } from "@phosphor-icons/react";

import Link from "next/link";
import { dummyLogin } from "@/interface/auth";
import { LoginInput, loginSchema } from "@/schema/auth.schema";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});

  const loginMutation = useMutation({
    mutationFn: dummyLogin,
    onSuccess: () => onClose(),
  });

  const handleSubmit = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({ email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] });
      return;
    }
    setErrors({});
    loginMutation.mutate({ email, password });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {loginMutation.isError && (
          <p className="text-red-500 text-sm mt-2">{loginMutation.error.message}</p>
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