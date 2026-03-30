/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // Repo name as basePath (only in production build)
  basePath: isProd ? '/GolfClubPicker' : '',
  assetPrefix: isProd ? '/GolfClubPicker/' : '',

  images: {
    // next/image doesn't work with static export — use unoptimized
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
