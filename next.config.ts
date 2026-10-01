import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the app can be served from GitLab Pages (static host).
  // The app is a client-side mock (localStorage + mocked data, no server
  // features), so a static export is sufficient.
  output: "export",
  // GitLab Pages serves project sites under /<project-name>/, so the app must
  // know it lives at /DTN_Meteorologist (not the domain root) for its CSS/JS
  // and links to resolve. Overridable via BASE_PATH for other hosts.
  basePath: process.env.BASE_PATH ?? "/DTN_Meteorologist",
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
