import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const getToken = () => {
  return Cookies.get("access_token");
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  access?: string;
  data?: {
    access?: string;
  };
};

// Server-side rendering runs inside the Docker network and can't necessarily
// reach the public NEXT_PUBLIC_API_BASE_URL (e.g. it may be firewalled or
// bound to loopback on the host) - INTERNAL_API_BASE_URL lets it talk to the
// backend container directly. The browser always uses the public URL.
const baseURL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds - signup/login with email sending needs more time
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refresh = Cookies.get("refresh_token");
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/refresh/`,
        { refresh },
        { timeout: 30000 }
      )
      .then((response) => {
        const access = response.data.access ?? response.data.data?.access;
        if (!access) {
          throw new Error("Refresh response did not include an access token");
        }

        Cookies.set("access_token", access, { expires: 7 });
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        return access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const clearAuthTokens = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  delete api.defaults.headers.common["Authorization"];
};

api.interceptors.request.use(
  function (config) {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const access = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        clearAuthTokens();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
