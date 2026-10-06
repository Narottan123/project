/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack object silences Next.js 16 Turbopack custom webpack warning
  turbopack: {},

  // Optimize package imports
  experimental: {
    optimizePackageImports: ["react-icons"],
  },

  // Skip TypeScript checking during production build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
