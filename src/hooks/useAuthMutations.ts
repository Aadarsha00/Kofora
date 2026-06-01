"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginRequest, SignupRequest } from "@/interface/auth";
import * as authApi from "@/api/auth.api";

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onError: (err) => {
      console.error("[useLogin] Login API error:", err);
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
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["cart"] });
      onLogoutComplete?.();
    },
    onError: (err) => {
      console.error("[useLogout] Logout API error:", err);
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
    mutationFn: (credential: string) => authApi.googleLogin(credential),
  });
};
