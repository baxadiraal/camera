import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

/**
 * robots.txt. Закрыты только служебные разделы: админка, API и страницы
 * результатов поиска (бесконечные комбинации параметров засоряют индекс).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/*/search'],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  }
}
