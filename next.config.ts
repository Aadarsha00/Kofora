/** @type {import('next').NextConfig} */
const localMediaPatterns = [
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
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "8001",
    pathname: "/media/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "8001",
    pathname: "/media/**",
  },
];

const nextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: localMediaPatterns,
  },
};

export default nextConfig;
