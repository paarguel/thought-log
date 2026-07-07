import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Static export: the whole app is HTML/CSS/JS with no server, so it can be
  // bundled into the Capacitor iOS shell and served from disk, fully offline.
  output: "export",
  // Folder-per-route (history/index.html) so Capacitor's local file server
  // resolves /history without needing rewrite rules.
  trailingSlash: true,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
