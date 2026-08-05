import type { MetadataRoute } from 'next'
import { routing, localeHtmlLang } from '@/i18n/routing'
import { getAllPagePaths, getNews } from '@/lib/cms'
import { localeUrl } from '@/lib/seo'

export const revalidate = 3600

/**
 * sitemap.xml формируется автоматически из CMS.
 *
 * У каждого URL перечислены языковые альтернативы (xhtml:link hreflang),
 * которые Next выводит из поля alternates.languages — поисковику не нужно
 * догадываться, что четыре адреса это одна и та же страница.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  const alternatesFor = (path: string) => {
    const languages: Record<string, string> = {}
    for (const locale of routing.locales) {
      languages[localeHtmlLang[locale]] = localeUrl(locale, path)
    }
    return { languages }
  }

  // Статические маршруты
  const staticPaths = ['/', '/news', '/sitemap', '/privacy']
  for (const path of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: new Date(),
        changeFrequency: path === '/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.6,
        alternates: alternatesFor(path),
      })
    }
  }

  // Страницы разделов
  const pages = await getAllPagePaths(routing.defaultLocale)
  for (const page of pages) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, page.path),
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: alternatesFor(page.path),
      })
    }
  }

  // Новости
  const news = await getNews(routing.defaultLocale, { limit: 200 })
  for (const item of news.items) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, `/news/${item.slug}`),
        lastModified: new Date(item.publishedAt),
        changeFrequency: 'yearly',
        priority: 0.5,
        alternates: alternatesFor(`/news/${item.slug}`),
      })
    }
  }

  return entries
}
