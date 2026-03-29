const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: isProd ? 'https://yuno-geospatial-social-media-1.onrender.com/api' : 'http://localhost:5000/api',
    NEXT_PUBLIC_SOCKET_URL: isProd ? 'https://yuno-geospatial-social-media-1.onrender.com' : 'http://localhost:5000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-google-maps/api'],
  },
};
