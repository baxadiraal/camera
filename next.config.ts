import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Итоговый docker-образ запускается как `node server.js` без node_modules
  output: 'standalone',
  // Всё содержимое отдаётся с локального сервера в Узбекистане:
  // внешних доменов для картинок нет принципиально (хотлинк запрещён).
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [96, 128, 192, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    // Точечный импорт иконок/утилит, чтобы не тянуть бандл целиком
    optimizePackageImports: ['next-intl'],
  },
  async headers() {
    return [
      {
        // Шрифты неизменяемы — кешируем навсегда
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
