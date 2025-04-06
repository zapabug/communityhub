/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to reduce the number of renders
  swcMinify: true,
  images: {
    domains: [
      'void.cat',
      'i.imgur.com',
      'imgur.com',
      'nostr.build',
      'image.nostr.build',
      'media.tenor.com',
      'cdn.discordapp.com',
      'images.unsplash.com'
    ],
  },
  // Optimize builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Reduce memory usage
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
    outputFileTracingIgnores: ['**/*.wasm', 'canvas/**/*'],
  },
  // Prevent crashes due to high memory usage
  webpack: (config, { isServer }) => {
    // Optimize memory usage
    config.optimization.moduleIds = 'deterministic';
    
    // Increase max memory limit for Node.js
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    
    return config;
  },
};

module.exports = nextConfig; 