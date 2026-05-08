"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { User } from "@/interface/auth";
import api from "@/axios/api.axios";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  setAuthUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_STORAGE_KEY = "auth_user";

const getStoredUser = (): User | null => {
  const storedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

const getProfileFromResponse = (payload: unknown): User | null => {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as { data?: unknown };
  if (response.data && typeof response.data === "object" && "email" in response.data) {
    return response.data as User;
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const token = Cookies.get("access_token");
      if (!token) {
        window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUser(getStoredUser());

      api
        .get("/users/me/")
        .then((response) => {
          const profile = getProfileFromResponse(response.data);
          if (profile) {
            setUser(profile);
            window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(profile));
          }
        })
        .catch(() => {
          // Keep the cached profile if the profile request fails temporarily.
        })
        .finally(() => setIsLoading(false));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const setAuthUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
    setIsAuthenticated(true); // ✅ Always mark as authenticated regardless of user data shape
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    setAuthUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
