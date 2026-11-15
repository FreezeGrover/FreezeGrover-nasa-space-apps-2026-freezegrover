import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "terminal.local"],
};
export default nextConfig;
