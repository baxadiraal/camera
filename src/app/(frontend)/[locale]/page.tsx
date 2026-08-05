import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/i18n/routing'
import { getContacts, getHomeContent } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'

import { Hero } from '@/components/home/Hero'
import { QuickActions } from '@/components/home/QuickActions'
import { AdmissionTimeline } from '@/components/home/AdmissionTimeline'
import { NewsGrid } from '@/components/news/NewsGrid'
import { StatsSection } from '@/components/home/StatsSection'
import { ServiceGrid } from '@/components/home/ServiceGrid'
import { PartnerLogos } from '@/components/home/PartnerLogos'
import { OrganizationJsonLd } from '@/components/seo/JsonLd'

/** Статическая генерация всех локалей + инкрементальное обновление раз в 5 минут. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const [tSite, tHome] = await Promise.all([
    getTranslations({ locale, namespace: 'site' }),
    getTranslations({ locale, namespace: 'stats' }),
  ])
  const hero = await getHomeContent(locale as Locale)

  return buildMetadata({
    locale: locale as Locale,
    path: '/',
    // Заголовок главной — без шаблона с названием вуза, иначе выйдем за 60 символов
    title: tSite('shortName'),
    description: hero.hero.subtitle || tHome('subtitle'),
    siteName: tSite('shortName'),
  })
}

/**
 * Главная страница.
 *
 * Порядок блоков сверху вниз: первый экран → быстрые действия → приёмная
 * кампания → новости → цифры → услуги → полезные ресурсы. Все данные
 * забираются одним параллельным запросом к CMS в getHomeContent().
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const typedLocale = locale as Locale
  const [content, contacts, tSite] = await Promise.all([
    getHomeContent(typedLocale),
    getContacts(typedLocale),
    getTranslations({ locale, namespace: 'site' }),
  ])

  return (
    <>
      <OrganizationJsonLd
        locale={typedLocale}
        name={tSite('fullName')}
        description={content.hero.subtitle}
        contacts={contacts}
      />

      <Hero hero={content.hero} />
      <QuickActions actions={content.quickActions} />
      <AdmissionTimeline stages={content.admissionStages} locale={typedLocale} />
      <NewsGrid items={content.news} locale={typedLocale} />
      <StatsSection stats={content.stats} locale={typedLocale} />
      <ServiceGrid services={content.services} />
      <PartnerLogos partners={content.partners} />
    </>
  )
}
