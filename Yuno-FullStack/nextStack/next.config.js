/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://yuno-full-stack-auqgy5drv-aakarsh12xs-projects.vercel.app/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://yuno-full-stack-auqgy5drv-aakarsh12xs-projects.vercel.app',
  },
};

module.exports = nextConfig;

