"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Eye, GoogleLogo, FacebookLogo } from "@phosphor-icons/react";
import { SignupInput, signupSchema } from "@/schema/auth.schema";
import { dummySignup } from "@/interface/auth";


interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});

  const signupMutation = useMutation({
    mutationFn: dummySignup,
    onSuccess: () => onClose(),
  });

  const handleSubmit = () => {
    const name = `${firstName} ${lastName}`.trim();
    const result = signupSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }
    setErrors({});
    signupMutation.mutate({ name, email, password, confirmPassword });
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

        <h2 className="text-center text-xl font-semibold mb-2">Create Account</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Sign up for faster checkout and order tracking.
        </p>

        {/* Email first */}
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

        {/* First + Last name side by side */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
        {errors.name && <p className="text-red-500 text-xs -mt-2 mb-2">{errors.name}</p>}

        {/* Password */}
        <div className="mb-3">
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

        {/* Confirm Password */}
        <div className="mb-3">
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        {signupMutation.isError && (
          <p className="text-red-500 text-sm mt-2">{signupMutation.error.message}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={signupMutation.isPending}
          className="w-full bg-[#253E38] text-white py-3 text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity cursor-pointer rounded-sm disabled:opacity-60 mt-2"
        >
          {signupMutation.isPending ? "Creating account..." : "Sign Up"}
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
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="font-semibold text-black underline hover:opacity-60 transition-opacity cursor-pointer"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}