/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
  OTPRequest,
  OTPVerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/interface/auth";
import Cookies from "js-cookie";

type RawLoginResponse = {
  access: string;
  refresh: string;
  user?: User;
};

function isAuthResponse(payload: AuthResponse | RawLoginResponse): payload is AuthResponse {
  return "data" in payload && payload.data !== null && "access" in payload.data;
}

function normalizeLoginResponse(payload: AuthResponse | RawLoginResponse): AuthResponse {
  if (isAuthResponse(payload)) {
    return payload;
  }

  return {
    success: true,
    message: "Login successful",
    data: {
      access: payload.access,
      refresh: payload.refresh,
      user: payload.user,
    },
  };
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse | RawLoginResponse>("/auth/login/", credentials);
    const normalizedResponse = normalizeLoginResponse(response.data);
    const { access, refresh } = normalizedResponse.data;
    
    // Store tokens in cookies
    Cookies.set("access_token", access, { expires: 7 });
    Cookies.set("refresh_token", refresh, { expires: 7 });
    
    // Set default auth header
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    
    return normalizedResponse;
  } catch (error: any) {
    // Handle timeout errors
    if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
      throw new Error("Request timeout. Please try again.");
    }
    throw error?.response?.data || new Error(error?.message || "Login failed");
  }
};

type ApiErrorPayload = {
  message?: string;
  detail?: string;
  errors?: Record<string, unknown> | string;
};

function formatApiError(errorData: ApiErrorPayload | undefined, fallback: string): string {
  if (!errorData) return fallback;

  if (errorData.errors && typeof errorData.errors === "object") {
    const allErrors = Object.entries(errorData.errors).flatMap(([field, messages]) => {
      const label = field === "non_field_errors" ? "" : `${field}: `;
      if (Array.isArray(messages)) {
        return messages.map((message) => `${label}${String(message)}`);
      }
      return [`${label}${String(messages)}`];
    });
    if (allErrors.length > 0) return allErrors.join(" ");
  }

  if (typeof errorData.errors === "string") return errorData.errors;
  return errorData.message || errorData.detail || fallback;
}

export const signup = async (data: SignupRequest): Promise<ApiErrorPayload> => {
  try {
    const response = await api.post("/auth/register/", data);
    return response.data;
  } catch (error: any) {
    // Handle timeout errors
    if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
      throw new Error("Request timeout. Please try again.");
    }

    throw new Error(formatApiError(error?.response?.data, error?.message || "Signup failed"));
  }
};

export const logout = async (): Promise<any> => {
  try {
    const refreshToken = Cookies.get("refresh_token");
    const response = await api.post("/auth/logout/", { refresh: refreshToken });
    
    // Clear tokens from cookies
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    
    // Remove auth header
    delete api.defaults.headers.common["Authorization"];
    
    return response.data;
  } catch (error: any) {
    // Clear tokens even if logout fails
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    delete api.defaults.headers.common["Authorization"];
    throw error?.response?.data;
  }
};

export const refreshToken = async (): Promise<any> => {
  try {
    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    const response = await api.post("/auth/token/refresh/", { refresh: refreshToken });
    const access = response.data?.access ?? response.data?.data?.access;
    if (!access) {
      throw new Error("Refresh response did not include an access token");
    }
    
    // Update access token
    Cookies.set("access_token", access, { expires: 7 });
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    
    return response.data;
  } catch (error: any) {
    // If refresh fails, clear tokens
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    delete api.defaults.headers.common["Authorization"];
    throw error?.response?.data;
  }
};

export const requestOTP = async (data: OTPRequest): Promise<any> => {
  try {
    const response = await api.post("/auth/otp/send/", data);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const verifyOTP = async (data: OTPVerifyRequest): Promise<any> => {
  try {
    const response = await api.post("/auth/otp/verify/", data);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<any> => {
  try {
    const response = await api.post("/auth/forgot-password/", data);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<any> => {
  try {
    const response = await api.post("/auth/reset-password/", data);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const googleLogin = async (credential: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/google/login/", { credential });
    const { access, refresh } = response.data.data;
    
    // Store tokens in cookies
    Cookies.set("access_token", access, { expires: 7 });
    Cookies.set("refresh_token", refresh, { expires: 7 });
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
