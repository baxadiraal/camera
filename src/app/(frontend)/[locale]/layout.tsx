import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import '../globals.css'
import { routing, localeHtmlLang, type Locale } from '@/i18n/routing'
import { getAnalytics, getContacts, getNavigation } from '@/lib/cms'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ConsentAnalytics } from '@/components/layout/ConsentAnalytics'
import { A11Y_INIT_SCRIPT } from '@/components/layout/A11yToolbar'
import { siteUrl } from '@/lib/seo'

/** Страницы всех локалей пререндерятся на сборке и обновляются по ISR. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const revalidate = 300

export const viewport: Viewport = {
  themeColor: '#1B2A5B',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'site' })

  return {
    metadataBase: new URL(siteUrl()),
    // Шаблон добавляет название вуза к заголовку каждой страницы,
    // а сами заголовки страниц остаются в пределах 60 символов
    title: { default: t('fullName'), template: `%s · ${t('shortName')}` },
    applicationName: t('shortName'),
    icons: { icon: '/media/logo.svg' },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Включает статический рендер: без этого страницы стали бы динамическими
  setRequestLocale(locale)

  const typedLocale = locale as Locale
  const [nav, contacts, analytics, t] = await Promise.all([
    getNavigation(typedLocale),
    getContacts(typedLocale),
    getAnalytics(),
    getTranslations({ locale, namespace: 'common' }),
  ])

  return (
    <html lang={localeHtmlLang[typedLocale]} suppressHydrationWarning>
      <head>
        {/* Латинские подмножества нужны на любой странице — предзагружаем.
            Кириллица подключается по unicode-range только там, где встречается. */}
        <link
          rel="preload"
          href="/fonts/inter-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-latin-ext-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Настройки доступности применяются до первой отрисовки */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a href="#main-content" className="skip-link">
            {t('skipToContent')}
          </a>

          <Header nav={nav} />

          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>

          <Footer nav={nav} contacts={contacts} />

          <ConsentAnalytics
            provider={analytics.provider}
            scriptUrl={analytics.scriptUrl}
            websiteId={analytics.websiteId}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
