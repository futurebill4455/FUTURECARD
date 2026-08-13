/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "btommilmsujkxkkwttkv.supabase.co" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  experimental: {
    serverMinification: false,
    serverActions: {
      bodySizeLimit: "42mb",
    },
  },
};

module.exports = nextConfig;
