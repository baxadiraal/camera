import type { ContactBlock, NewsItem } from '@/types/content'
import type { Locale } from '@/i18n/routing'
import { localeHtmlLang } from '@/i18n/routing'
import { siteUrl, localeUrl } from '@/lib/seo'

/**
 * Разметка Schema.org.
 *
 * Отдаётся одним <script type="application/ld+json"> на страницу.
 * JSON сериализуется с экранированием «<», чтобы содержимое из CMS
 * не могло закрыть тег и попасть в разметку как HTML.
 */
function JsonLdScript({ data }: { readonly data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

/** EducationalOrganization — на главной странице. */
export function OrganizationJsonLd({
  locale,
  name,
  description,
  contacts,
}: {
  readonly locale: Locale
  readonly name: string
  readonly description: string
  readonly contacts: ContactBlock
}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name,
        description,
        url: localeUrl(locale, '/'),
        inLanguage: localeHtmlLang[locale],
        logo: `${siteUrl()}/media/logo.svg`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: contacts.address,
          addressLocality: 'Nukus',
          addressRegion: 'Karakalpakstan',
          addressCountry: 'UZ',
        },
        telephone: contacts.phones[0],
        email: contacts.emails[0],
        sameAs: contacts.socials.map((social) => social.href),
      }}
    />
  )
}

/** NewsArticle — на странице новости. */
export function NewsArticleJsonLd({
  locale,
  item,
  organizationName,
}: {
  readonly locale: Locale
  readonly item: NewsItem
  readonly organizationName: string
}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: item.title,
        description: item.excerpt,
        datePublished: item.publishedAt,
        dateModified: item.publishedAt,
        inLanguage: localeHtmlLang[locale],
        mainEntityOfPage: localeUrl(locale, `/news/${item.slug}`),
        image: item.cover ? [`${siteUrl()}${item.cover.url}`] : undefined,
        author: { '@type': 'Organization', name: organizationName },
        publisher: {
          '@type': 'Organization',
          name: organizationName,
          logo: { '@type': 'ImageObject', url: `${siteUrl()}/media/logo.svg` },
        },
      }}
    />
  )
}

/** BreadcrumbList — на каждой внутренней странице. */
export function BreadcrumbJsonLd({
  locale,
  items,
}: {
  readonly locale: Locale
  readonly items: readonly { label: string; href: string }[]
}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: localeUrl(locale, item.href),
        })),
      }}
    />
  )
}
