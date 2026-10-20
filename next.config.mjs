// Static export for GitHub Pages: `next build` writes the whole site to out/.
// BASE_PATH is "/onetake-site" on github.io and empty once a custom domain points at the site.
const basePath = process.env.BASE_PATH ?? "/onetake-site";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
