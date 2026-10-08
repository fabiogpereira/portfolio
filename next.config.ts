import type { NextConfig } from "next";

// No GitHub Pages o site mora em /portfolio e é exportado como arquivos estáticos.
// Localmente (npm run dev) roda na raiz, sem prefixo.
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/portfolio" : "";

const nextConfig: NextConfig = {
  ...(pages ? { output: "export" as const, basePath, trailingSlash: true } : {}),
  images: { unoptimized: pages },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
