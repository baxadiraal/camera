import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/i18n/routing'
import { getNews, getNewsBySlug } from '@/lib/cms'
import { buildMetadata, siteUrl } from '@/lib/seo'
import { formatDate } from '@/lib/format'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { BreadcrumbJsonLd, NewsArticleJsonLd } from '@/components/seo/JsonLd'
import { Picture } from '@/components/ui/Picture'
import { CategoryBadge } from '@/components/news/CategoryBadge'
import { RichText } from '@/components/ui/RichText'

export const revalidate = 300

/** Пререндерим последние новости; остальные соберутся по первому запросу. */
export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of routing.locales) {
    const news = await getNews(locale, { limit: 20 })
    for (const item of news.items) params.push({ locale, slug: item.slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const typedLocale = locale as Locale
  const [item, tSite] = await Promise.all([
    getNewsBySlug(typedLocale, slug),
    getTranslations({ locale, namespace: 'site' }),
  ])
  if (!item) return {}

  return buildMetadata({
    locale: typedLocale,
    path: `/news/${slug}`,
    title: item.title,
    description: item.excerpt,
    siteName: tSite('shortName'),
    type: 'article',
    publishedTime: item.publishedAt,
    image: item.cover ? `${siteUrl()}${item.cover.url}` : undefined,
  })
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const typedLocale = locale as Locale
  const [item, t, tSite] = await Promise.all([
    getNewsBySlug(typedLocale, slug),
    getTranslations({ locale, namespace: 'news' }),
    getTranslations({ locale, namespace: 'site' }),
  ])

  if (!item) notFound()

  const crumbs = [
    { label: t('title'), href: '/news' },
    { label: item.title, href: `/news/${item.slug}` },
  ]

  return (
    <>
      <Breadcrumbs items={[{ label: t('title'), href: '/news' }, { label: item.title }]} />
      <BreadcrumbJsonLd locale={typedLocale} items={crumbs} />
      <NewsArticleJsonLd
        locale={typedLocale}
        item={item}
        organizationName={tSite('fullName')}
      />

      <article className="container-page py-12 md:py-18">
        <div className="max-w-prose">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryBadge category={item.category} />
            {/* Дата публикации — текст, а не ссылка на архив */}
            <time dateTime={item.publishedAt} className="text-sm text-ink-muted">
              {t('publishedOn', { date: formatDate(item.publishedAt, typedLocale) })}
            </time>
          </div>

          <h1 className="mt-4 text-h4 text-ink-brand md:text-h3">{item.title}</h1>
        </div>

        {item.cover && (
          <Picture
            image={item.cover}
            sizes="(max-width: 1024px) 100vw, 960px"
            priority
            className="mt-8 block overflow-hidden rounded"
            imageClassName="h-auto w-full object-cover"
          />
        )}

        <div className="mt-8 max-w-prose">
          {/* Анонс — лид-абзац, дальше идёт полный текст из редактора */}
          <p className="text-lg text-ink">{item.excerpt}</p>
          <RichText value={item.content} />
        </div>
      </article>
    </>
  )
}
