/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://wmahociyiwfckxmzawgr.supabase.co",
      },
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wmahociyiwfckxmzawgr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://waitlist-417.created.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
