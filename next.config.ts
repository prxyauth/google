const nextConfig = {
  output: "export",
  distDir: "google",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: '/google',
  assetPrefix: '/google/',
  env: {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;