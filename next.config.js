// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public', // Output directory for service worker
  register: true, // Automatically register service worker
  skipWaiting: true, // Activate service worker immediately
  scope: '/app',
  sw: 'service-worker.js',
  disable: false, // Disable in development mode
});

module.exports = withPWA({
  reactStrictMode: true,
}); 