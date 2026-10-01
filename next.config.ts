import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the app can be served from GitLab Pages (static host).
  // The app is a client-side mock (localStorage + mocked data, no server
  // features), so a static export is sufficient.
  output: "export",
  images: {
    // next/image optimization needs a server; disable it for static export.
    unoptimized: true,
  },
  // Allow the dev server's HMR / _next resources to be loaded when the app is
  // viewed through a tunnel (Cloudflare quick tunnel) for sharing locally.
  allowedDevOrigins: [
    "deluxe-whom-brunette-power.trycloudflare.com",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
