// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public', // Output directory for service worker
  register: true, // Automatically register service worker
  skipWaiting: true, // Activate service worker immediately
  scope: '/app',
  sw: 'service-worker.js',
  disable: false, // Disable in development mode
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      rules: {
        // Optionally configure Turbopack rules here
      }
    }
  },
  // Add any other Next.js config options here
}

module.exports = nextConfig 