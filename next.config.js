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
  // Next 15.5's minify-webpack-plugin can throw
  // `TypeError: WebpackError is not a constructor` (especially on Node 24).
  // Disable that plugin; client minification is unchanged.
  experimental: {
    serverMinification: false,
    serverActions: {
      bodySizeLimit: "42mb",
    },
  },
};

module.exports = nextConfig;
