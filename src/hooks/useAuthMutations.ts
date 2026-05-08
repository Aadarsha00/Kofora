"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginRequest, SignupRequest } from "@/interface/auth";
import * as authApi from "@/api/auth.api";

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => {
      console.log("[useLogin] Calling login API...");
      return authApi.login(credentials);
    },
    onSuccess: (data) => {
      console.log("[useLogin] ✅ Login API success. Raw response:", JSON.stringify(data, null, 2));
    },
    onError: (err) => {
      console.error("[useLogin] ❌ Login API error:", err);
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
  });
};

export const useLogout = (onLogoutComplete?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      console.log("[useLogout] Calling logout API...");
      return authApi.logout();
    },
    onSuccess: () => {
      console.log("[useLogout] ✅ Logout API success");
      console.log("[useLogout] Cart cache BEFORE remove:", queryClient.getQueryData(["cart"]));
      queryClient.removeQueries({ queryKey: ["cart"] });
      console.log("[useLogout] Cart cache AFTER remove:", queryClient.getQueryData(["cart"]));
      onLogoutComplete?.();
    },
    onError: (err) => {
      console.error("[useLogout] ❌ Logout API error:", err);
      queryClient.removeQueries({ queryKey: ["cart"] });
      onLogoutComplete?.();
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => authApi.refreshToken(),
  });
};

export const useRequestOTP = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.requestOTP(data),
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: (data: { email: string; code: string }) => authApi.verifyOTP(data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; new_password: string }) =>
      authApi.resetPassword(data),
  });
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: (code: string) => authApi.googleLogin(code),
  });
};