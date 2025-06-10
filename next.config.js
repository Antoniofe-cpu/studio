
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.thumbs.redditmedia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'b.thumbs.redditmedia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'external-preview.redd.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'preview.redd.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.redd.it', // Ensuring this is present
        port: '',
        pathname: '/**',
      },
      // Aggiungi qui altri domini se in futuro faremo scraping da altri siti
      // Esempio per Chrono24:
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.chrono24.com',
      //   port: '',
      //   pathname: '/**',
      // }
    ],
  },
  transpilePackages: ['firebase', '@firebase/auth'],
};

module.exports = nextConfig;
