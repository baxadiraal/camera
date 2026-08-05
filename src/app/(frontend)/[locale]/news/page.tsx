import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/i18n/routing'
import { getNews } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { NewsCard } from '@/components/news/NewsCard'
import { Pagination } from '@/components/ui/Pagination'

export const revalidate = 300

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const [t, tSite] = await Promise.all([
    getTranslations({ locale, namespace: 'news' }),
    getTranslations({ locale, namespace: 'site' }),
  ])

  return buildMetadata({
    locale: locale as Locale,
    path: '/news',
    title: t('title'),
    description: t('subtitle'),
    siteName: tSite('shortName'),
  })
}

/** Лента новостей с постраничной навигацией. */
export default async function NewsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ locale }, { page }] = await Promise.all([params, searchParams])
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const typedLocale = locale as Locale
  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
  const [t, news] = await Promise.all([
    getTranslations({ locale, namespace: 'news' }),
    getNews(typedLocale, { page: currentPage, limit: 9 }),
  ])

  const crumbs = [{ label: t('title'), href: '/news' }]

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <BreadcrumbJsonLd locale={typedLocale} items={[{ label: t('title'), href: '/news' }]} />

      <div className="container-page py-12 md:py-18">
        <h1 className="text-h3 text-ink-brand md:text-h2">{t('title')}</h1>
        <p className="mt-3 max-w-prose text-lg text-ink-muted">{t('subtitle')}</p>

        {news.items.length === 0 ? (
          <p className="mt-10 text-base text-ink-muted">{t('empty')}</p>
        ) : (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.items.map((item) => (
              <li key={item.id} className="h-full">
                <NewsCard item={item} locale={typedLocale} />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={news.totalPages}
          basePath="/news"
        />
      </div>
    </>
  )
}
