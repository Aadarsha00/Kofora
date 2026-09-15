import type { NextConfig } from "next";

type RemotePatterns = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>;
type RemotePattern = Exclude<RemotePatterns[number], URL>;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiMediaPattern = (() => {
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(apiBaseUrl);
    const protocol = parsed.protocol === "https:" ? "https" : parsed.protocol === "http:" ? "http" : null;

    if (!protocol) {
      return null;
    }

    return {
      protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: "/media/**",
    } satisfies RemotePattern;
  } catch {
    return null;
  }
})();

const localMediaPatterns: RemotePatterns = [
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "8000",
    pathname: "/media/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/media/**",
  },
  ...(apiMediaPattern ? [apiMediaPattern] : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: localMediaPatterns,
  },
};
export default nextConfig;
