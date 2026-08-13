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
  // `TypeError: WebpackError is not a constructor` and fail the Vercel build.
  // Server minify is off; the broken client MinifyPlugin is removed below.
  experimental: {
    serverMinification: false,
    serverActions: {
      bodySizeLimit: "42mb",
    },
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      // Next registers MinifyPlugin as a function, not a class instance, so
      // constructor-name filters miss it. Turning minimize off is the reliable
      // way to skip the WebpackError crash on Vercel.
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
    }
    return config;
  },
};

module.exports = nextConfig;
