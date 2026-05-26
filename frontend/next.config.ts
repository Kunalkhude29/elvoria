import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // the project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // ── Cloudinary ────────────────────────────────────────────────
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // ── Supabase Storage ──────────────────────────────────────────
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // ── Local dev backend ─────────────────────────────────────────
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
