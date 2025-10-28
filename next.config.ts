import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Next.js to use the correct URL for redirects
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-host',
          },
        ],
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
