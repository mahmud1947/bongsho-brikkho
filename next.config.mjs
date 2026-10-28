const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/bongsho-brikkho" : "",
  assetPrefix: isProd ? "/bongsho-brikkho/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
