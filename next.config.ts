import type {NextConfig} from 'next';

// Disables TLS rejection for upstream media and image hosts (such as top4top.io) with expired SSL certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig: NextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { protocol: 'https', hostname: '**.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'k.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'l.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'a.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'b.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'c.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'd.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'e.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'f.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'g.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'h.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'i.top4top.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'j.top4top.io', port: '', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
