import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/i18n/routing'
import { searchContent } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'
import { Link } from '@/i18n/navigation'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const [t, tSite] = await Promise.all([
    getTranslations({ locale, namespace: 'search' }),
    getTranslations({ locale, namespace: 'site' }),
  ])

  return {
    ...buildMetadata({
      locale: locale as Locale,
      path: '/search',
      title: t('title'),
      description: t('hint'),
      siteName: tSite('shortName'),
      noIndex: true, // страницы результатов поиска в индексе не нужны
    }),
  }
}

/**
 * Результаты поиска.
 * Форма отправляется обычным GET-запросом, поэтому поиск работает
 * и без JavaScript, а результат можно переслать ссылкой.
 */
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const [{ locale }, { q }] = await Promise.all([params, searchParams])
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const typedLocale = locale as Locale
  const query = (q ?? '').trim()
  const [t, hits] = await Promise.all([
    getTranslations({ locale, namespace: 'search' }),
    searchContent(typedLocale, query),
  ])

  return (
    <>
      <Breadcrumbs items={[{ label: t('title') }]} />

      <div className="container-page py-12 md:py-18">
        <h1 className="text-h3 text-ink-brand md:text-h2">{t('title')}</h1>

        <form action="" method="get" role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="search-input" className="visually-hidden">
            {t('queryLabel')}
          </label>
          <input
            id="search-input"
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t('placeholder')}
            className="w-full rounded border border-edge-strong bg-surface px-4 py-3 text-base text-ink"
          />
          <button
            type="submit"
            className="rounded bg-action px-5 py-3 text-base font-medium text-white hc-invert-text"
          >
            {t('submit')}
          </button>
        </form>

        {query.length >= 2 && (
          <>
            <p aria-live="polite" className="mt-8 text-base text-ink-muted">
              {hits.length > 0 ? t('results', { count: hits.length }) : t('empty')}
            </p>

            {hits.length > 0 && (
              <ul className="mt-6 divide-y divide-edge border-y border-edge">
                {hits.map((hit) => (
                  <li key={`${hit.kind}-${hit.href}`} className="py-4">
                    <Link
                      href={hit.href}
                      className="text-lg font-medium text-ink-brand underline-offset-4 hover:underline"
                    >
                      {hit.title}
                    </Link>
                    {hit.excerpt && <p className="mt-1 text-base text-ink-muted">{hit.excerpt}</p>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  )
}
