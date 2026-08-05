import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/i18n/routing'
import { buildMetadata } from '@/lib/seo'
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
    getTranslations({ locale, namespace: 'privacy' }),
    getTranslations({ locale, namespace: 'site' }),
  ])

  return buildMetadata({
    locale: locale as Locale,
    path: '/privacy',
    title: t('title'),
    description: t('intro'),
    siteName: tSite('shortName'),
  })
}

/**
 * Политика конфиденциальности.
 * Базовый текст лежит в словарях, потому что он обязателен и должен быть
 * доступен даже при пустой CMS; расширенную редакцию юрист публикует
 * страницей в админке.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'privacy' })

  return (
    <>
      <Breadcrumbs items={[{ label: t('title') }]} />

      <div className="container-page py-12 md:py-18">
        <h1 className="max-w-prose text-h3 text-ink-brand md:text-h2">{t('title')}</h1>
        <div className="mt-6 max-w-prose space-y-4 text-base text-ink">
          <p>{t('intro')}</p>
          <p>{t('analytics')}</p>
          <p>{t('cookies')}</p>
          <p>{t('contact')}</p>
        </div>
      </div>
    </>
  )
}
