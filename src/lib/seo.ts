import type { Metadata } from 'next'
import { localeHtmlLang, localeOpenGraph, routing, type Locale } from '@/i18n/routing'

/** Базовый адрес сайта; в докере задаётся переменной NEXT_PUBLIC_SITE_URL. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

/** Абсолютный URL страницы в конкретной локали. */
export function localeUrl(locale: Locale, path = '/'): string {
  const clean = path === '/' ? '' : `/${path.replace(/^\/+/, '')}`
  return `${siteUrl()}/${locale}${clean}`
}

/**
 * Ограничение длины метатегов.
 * Поисковики обрезают title примерно на 60 символах, description — на 155;
 * лучше подрезать самим по границе слова, чем показать «…» посреди слова.
 */
export function clamp(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const head = clean.slice(0, limit - 1)
  const lastSpace = head.lastIndexOf(' ')
  return `${(lastSpace > limit * 0.6 ? head.slice(0, lastSpace) : head).replace(/[,.;:—-]+$/, '')}…`
}

interface MetadataInput {
  readonly locale: Locale
  readonly path: string
  readonly title: string
  readonly description: string
  readonly siteName: string
  /** Готовая картинка для соцсетей; иначе генерируется /api/og */
  readonly image?: string
  readonly type?: 'website' | 'article'
  readonly publishedTime?: string
  readonly noIndex?: boolean
}

/**
 * Единая сборка метаданных страницы.
 *
 * Здесь же собираются alternates: для каждой локали свой canonical,
 * hreflang на все четыре языка и x-default на локаль по умолчанию (qq).
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  siteName,
  image,
  type = 'website',
  publishedTime,
  noIndex = false,
}: MetadataInput): Metadata {
  const url = localeUrl(locale, path)
  const clampedTitle = clamp(title, 60)
  const clampedDescription = clamp(description, 155)

  const languages: Record<string, string> = {}
  for (const item of routing.locales) {
    languages[localeHtmlLang[item]] = localeUrl(item, path)
  }
  languages['x-default'] = localeUrl(routing.defaultLocale, path)

  const ogImage =
    image ??
    `${siteUrl()}/api/og?title=${encodeURIComponent(clamp(title, 90))}&locale=${locale}`

  return {
    title: clampedTitle,
    description: clampedDescription,
    metadataBase: new URL(siteUrl()),
    alternates: { canonical: url, languages },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type,
      url,
      siteName,
      title: clampedTitle,
      description: clampedDescription,
      locale: localeOpenGraph[locale],
      images: [{ url: ogImage, width: 1200, height: 630, alt: clampedTitle }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: clampedTitle,
      description: clampedDescription,
      images: [ogImage],
    },
  }
}
