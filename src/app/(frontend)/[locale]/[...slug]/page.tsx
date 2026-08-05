import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from '@/i18n/routing'
import { getNavigation, getPage, type PageDoc } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'
import { Link } from '@/i18n/navigation'
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { Picture } from '@/components/ui/Picture'
import { RichText } from '@/components/ui/RichText'
import type { NavItem } from '@/types/content'

export const revalidate = 300

/**
 * Страницы разделов: и хабы верхнего уровня («Институт»), и их дети
 * («Институт → История»). Глубже двух уровней CMS уйти не даёт.
 */

/** Собирает страницу из меню, когда в CMS такой записи ещё нет. */
function fromNavigation(nav: readonly NavItem[], segments: readonly string[]): PageDoc | null {
  const path = `/${segments.join('/')}`

  const parent = nav.find((item) => item.href === path)
  if (parent) {
    return {
      id: path,
      title: parent.label,
      slug: segments[segments.length - 1] ?? '',
      noIndex: false,
      children: parent.children.map((child) => ({
        title: child.label,
        slug: child.href.split('/').filter(Boolean).slice(-1)[0] ?? '',
        excerpt: child.description,
      })),
    }
  }

  for (const item of nav) {
    const child = item.children.find((candidate) => candidate.href === path)
    if (child) {
      return {
        id: path,
        title: child.label,
        slug: segments[segments.length - 1] ?? '',
        parentSlug: item.href.replace(/^\//, ''),
        parentTitle: item.label,
        excerpt: child.description,
        noIndex: false,
        children: [],
      }
    }
  }

  return null
}

async function loadPage(locale: Locale, segments: readonly string[]) {
  const fromCms = await getPage(locale, segments)
  if (fromCms) return fromCms
  const nav = await getNavigation(locale)
  return fromNavigation(nav, segments)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const typedLocale = locale as Locale
  const [page, tSite] = await Promise.all([
    loadPage(typedLocale, slug),
    getTranslations({ locale, namespace: 'site' }),
  ])
  if (!page) return {}

  return buildMetadata({
    locale: typedLocale,
    path: `/${slug.join('/')}`,
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.excerpt ?? `${page.title} — ${tSite('shortName')}`,
    siteName: tSite('shortName'),
    noIndex: page.noIndex,
  })
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const typedLocale = locale as Locale
  const page = await loadPage(typedLocale, slug)
  if (!page) notFound()

  const crumbs: Crumb[] = []
  if (page.parentSlug && page.parentTitle) {
    crumbs.push({ label: page.parentTitle, href: `/${page.parentSlug}` })
  }
  crumbs.push({ label: page.title })

  const jsonLdCrumbs = crumbs.map((crumb, index) => ({
    label: crumb.label,
    href: crumb.href ?? `/${slug.slice(0, index + 1).join('/')}`,
  }))

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <BreadcrumbJsonLd locale={typedLocale} items={jsonLdCrumbs} />

      <article className="container-page py-12 md:py-18">
        <h1 className="max-w-prose text-h3 text-ink-brand md:text-h2">{page.title}</h1>
        {page.excerpt && (
          <p className="mt-4 max-w-prose text-lg text-ink-muted">{page.excerpt}</p>
        )}

        {page.heroImage && (
          <Picture
            image={page.heroImage}
            sizes="(max-width: 1024px) 100vw, 960px"
            className="mt-8 block overflow-hidden rounded"
            imageClassName="h-auto w-full object-cover"
          />
        )}

        <div className="mt-8">
          <RichText value={page.content} />
        </div>

        {/* Хаб раздела: карточки дочерних страниц вместо «мёртвого» текста */}
        {page.children.length > 0 && (
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.children.map((child) => (
              <li key={child.slug}>
                <Link
                  href={`/${[...slug, child.slug].join('/')}`}
                  className="flex h-full flex-col rounded border border-edge bg-surface p-5 transition-colors hover:border-brand"
                >
                  <span className="text-lg font-medium text-ink-brand">{child.title}</span>
                  {child.excerpt && (
                    <span className="mt-2 text-base text-ink-muted">{child.excerpt}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  )
}
