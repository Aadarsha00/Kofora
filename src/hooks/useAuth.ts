"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, FC } from "react";
import Cookies from "js-cookie";
import { User } from "@/interface/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  setAuthUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const token = Cookies.get("access_token");
      setIsAuthenticated(!!token);
      setIsLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const setAuthUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    setAuthUser,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};


