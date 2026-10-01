import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server's HMR / _next resources to be loaded when the app is
  // viewed through a tunnel (Cloudflare quick tunnel) for sharing. Without this
  // Next.js blocks cross-origin dev resources and the client never hydrates.
  allowedDevOrigins: [
    "deluxe-whom-brunette-power.trycloudflare.com",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
