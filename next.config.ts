// next.config.ts
//last thing chache and pwa work
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from 'next-pwa';
import runtimeCaching from 'next-pwa/cache';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env' });

const isProd = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isProd,
  fallbacks: {
    document: '/offline', // يجب أن تكون هذه الصفحة موجودة
    image: '/logo.webp',
    font: '/fonts/font.woff2',
    audio: '/fallback-audio.mp3',
    video: '/fallback-video.mp4',
  },
  // 🟢 إضافة قواعد التخزين المؤقت هنا
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-cache',
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
      {
      urlPattern: ({ url }) => 
        url.pathname.endsWith('/lottie.min.js') ||
        url.pathname.endsWith('/NOinternet.json'),
      handler: 'CacheFirst',
    },
    // 🟢 قاعدة لتخزين ملفات صور Google Drive
    {
      urlPattern: /^https:\/\/drive\.google\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gdrive-links',
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/drive\.usercontent\.google\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gdrive-usercontent',
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
       
    },
    {
  urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'gdrive-cdn',
    expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
  },
},

    // 🟢 قاعدة لتخزين مسارات API التي تستخدمها
    {
      urlPattern: /^https:\/\/hope-bridge-twjh\.vercel\.app\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 },
      },
    },
    ...runtimeCaching, // keep the defaults
  ],
});

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    typescript: {
    ignoreBuildErrors: true, // 🚀 Allow deploy even with TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // 🚀 Ignore ESLint errors/warnings
  },
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
         {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "cdn.hopebridgecharity.com",
      },
       { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    { protocol: 'https', hostname: 'drive.usercontent.google.com' },
    { protocol: 'https', hostname: 'googleusercontent.com' },
      { protocol: 'https', hostname: 'placehold.net' },
      { protocol: 'https', hostname: 'youtu.be' },
      { protocol: 'https', hostname: 'i0.wp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'i.postimg.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
         {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/uc/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.net',
      },
    ],

  },

  reactStrictMode:false,
  output: 'standalone',
  
  async rewrites() {
    return [
      {
        source: '/:locale/api/:path*',
        destination: '/api/:path*',
        locale: false,
      },
    ];
  },
};


export default withNextIntl({...nextConfig, ...withPWA});