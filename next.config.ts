import type { NextConfig } from "next";

// Derive the base path from GitLab's CI_PAGES_URL at build time so it always
// matches wherever Pages actually serves the site — whether that's a subpath
// (https://user.gitlab.io/Project/) or a unique domain served from root
// (https://project-hash.gitlab.io/). This avoids hardcoding a path that may
// not match GitLab's "unique domain" setting.
//
// CI_PAGES_URL examples:
//   https://cassidar.gitlab.io/DTN_Meteorologist  -> basePath "/DTN_Meteorologist"
//   https://dtn-meteorologist-abc123.gitlab.io    -> basePath "" (served at root)
//
// BASE_PATH env var still wins if set explicitly (local/other hosts).
function resolveBasePath(): string {
  if (process.env.BASE_PATH !== undefined) return process.env.BASE_PATH;
  const pagesUrl = process.env.CI_PAGES_URL;
  if (!pagesUrl) return "";
  try {
    const path = new URL(pagesUrl).pathname.replace(/\/$/, "");
    return path === "/" ? "" : path;
  } catch {
    return "";
  }
}

const basePath = resolveBasePath();

const nextConfig: NextConfig = {
  // Static export so the app can be served from GitLab Pages (static host).
  // The app is a client-side mock (localStorage + mocked data, no server
  // features), so a static export is sufficient.
  output: "export",
  // Emit each route as <route>/index.html so GitLab Pages serves clean
  // directory-style URLs. Without this, routes export as <route>.html and
  // Pages bounces between /route and /route/ (redirect loop).
  trailingSlash: true,
  // Computed from CI_PAGES_URL (see resolveBasePath above) so CSS/JS and links
  // resolve correctly regardless of GitLab's Pages URL scheme.
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
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
