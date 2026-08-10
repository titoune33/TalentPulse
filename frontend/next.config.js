/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export: deployable on Render Static Sites, Netlify, GitHub Pages...
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
