/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["ethers", "@supabase/supabase-js", "react-hook-form", "recharts", "@hookform/resolvers"],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
}

export default nextConfig
