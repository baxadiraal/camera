import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/i18n/routing'
import { getNavigation, getServices } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'
import { Link } from '@/i18n/navigation'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

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
    getTranslations({ locale, namespace: 'sitemapPage' }),
    getTranslations({ locale, namespace: 'site' }),
  ])

  return buildMetadata({
    locale: locale as Locale,
    path: '/sitemap',
    title: t('title'),
    description: t('subtitle'),
    siteName: tSite('shortName'),
  })
}

/** Человеческая карта сайта (машинная — /sitemap.xml). */
export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const typedLocale = locale as Locale
  const [t, tServices, tNews, nav, services] = await Promise.all([
    getTranslations({ locale, namespace: 'sitemapPage' }),
    getTranslations({ locale, namespace: 'services' }),
    getTranslations({ locale, namespace: 'news' }),
    getNavigation(typedLocale),
    getServices(typedLocale, { forMenu: true }),
  ])

  return (
    <>
      <Breadcrumbs items={[{ label: t('title') }]} />

      <div className="container-page py-12 md:py-18">
        <h1 className="text-h3 text-ink-brand md:text-h2">{t('title')}</h1>
        <p className="mt-3 text-lg text-ink-muted">{t('subtitle')}</p>

        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {nav.map((item) => (
            <section key={item.href}>
              <h2 className="text-lg font-semibold text-ink-brand">
                <Link href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </h2>
              <ul className="mt-3 space-y-2">
                {item.children.map((child) => (
                  <li key={`${item.href}-${child.href}`}>
                    <Link
                      href={child.href}
                      className="text-base text-ink underline-offset-4 hover:underline"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="text-lg font-semibold text-ink-brand">{tNews('title')}</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/news" className="text-base text-ink underline-offset-4 hover:underline">
                  {tNews('all')}
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink-brand">{tServices('title')}</h2>
            <ul className="mt-3 space-y-2">
              {services.map((service) => (
                <li key={service.id}>
                  {service.external ? (
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-ink underline-offset-4 hover:underline"
                    >
                      {service.title}
                    </a>
                  ) : (
                    <Link
                      href={service.href}
                      className="text-base text-ink underline-offset-4 hover:underline"
                    >
                      {service.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
