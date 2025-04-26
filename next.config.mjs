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
  },
  output: "export",
  
  // Disable static generation for Netlify
  env: {
    NEXT_PUBLIC_SKIP_STATIC_GENERATION: process.env.NETLIFY ? "true" : "false",
  },
}

export default nextConfig
