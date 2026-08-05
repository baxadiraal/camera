import 'server-only'
import type { Locale } from '@/i18n/routing'
import type {
  AdmissionStage,
  ContactBlock,
  HeroContent,
  HomeContent,
  ImageAsset,
  NavItem,
  NewsItem,
  PartnerItem,
  QuickAction,
  RichTextValue,
  ServiceItem,
  StatItem,
} from '@/types/content'
import {
  getFallbackContacts,
  getFallbackHero,
  getFallbackNavigation,
  getFallbackNews,
  getFallbackPartners,
  getFallbackQuickActions,
  getFallbackServices,
  getFallbackStages,
  getFallbackStats,
} from './fallback-content'
import { truncateOnWord } from './format'

/**
 * Слой доступа к контенту.
 *
 * Единственное место, где фронтенд знает про Payload. Если база недоступна
 * (первый запуск, CI, сборка образа), каждый запрос молча деградирует
 * до демо-контента из fallback-content.ts — страница всё равно отрисуется.
 *
 * Данные читаются через Local API: это прямой вызов внутри процесса,
 * без HTTP-хопа, что важно для бюджета LCP.
 */

/* ────────────────── Подключение к Payload ────────────────── */

type PayloadLike = {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[]; totalDocs: number; totalPages: number }>
  findGlobal(args: Record<string, unknown>): Promise<unknown>
}

let clientPromise: Promise<PayloadLike | null> | null = null

async function getCms(): Promise<PayloadLike | null> {
  if (!process.env.DATABASE_URI) return null

  clientPromise ??= (async () => {
    try {
      const [{ getPayload }, config] = await Promise.all([
        import('payload'),
        import('@payload-config'),
      ])
      return (await getPayload({ config: config.default })) as unknown as PayloadLike
    } catch (error) {
      console.warn('[cms] Payload недоступен, используется резервный контент:', error)
      return null
    }
  })()

  return clientPromise
}

/** Безопасный вызов CMS: любая ошибка означает «работаем на резервном контенте». */
async function query<T>(fn: (cms: PayloadLike) => Promise<T>): Promise<T | null> {
  const cms = await getCms()
  if (!cms) return null
  try {
    return await fn(cms)
  } catch (error) {
    console.warn('[cms] Ошибка запроса, отдаём резервный контент:', error)
    return null
  }
}

/* ────────────────── Разбор документов ────────────────── */

type Rec = Record<string, unknown>

const isRec = (value: unknown): value is Rec =>
  typeof value === 'object' && value !== null

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined

const num = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const bool = (value: unknown): boolean => value === true

const id = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

/**
 * Payload отдаёт ссылку на файл вместе с serverURL («https://…/api/media/file/x.webp»).
 * next/image принимает абсолютные адреса только для явно разрешённых доменов,
 * а вся наша медиатека и так лежит на этом же сервере — поэтому оставляем путь.
 */
function toRelativeUrl(url: string): string {
  if (url.startsWith('/')) return url
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

/** Приводит upload-документ медиатеки к ImageAsset; alt обязателен. */
function toImage(value: unknown, fallbackAlt: string): ImageAsset | undefined {
  if (!isRec(value)) return undefined
  const url = str(value.url)
  if (!url) return undefined
  return {
    url: toRelativeUrl(url),
    alt: str(value.alt) ?? fallbackAlt,
    width: num(value.width) ?? 1280,
    height: num(value.height) ?? 720,
    blurDataURL: str(value.blurDataURL),
  }
}

/** Внешняя ссылка определяется по схеме, а не по наличию домена в тексте. */
const isExternal = (href: string): boolean => /^https?:\/\//i.test(href)

/* ────────────────── Навигация ────────────────── */

function mapMenuLink(
  raw: Rec,
  services: readonly ServiceItem[],
): { label: string; href: string; description?: string } | null {
  const label = str(raw.label)
  if (!label) return null

  const type = str(raw.type) ?? 'page'
  const description = str(raw.description)

  if (type === 'external') {
    const url = str(raw.url)
    return url ? { label, href: url, description } : null
  }
  if (type === 'news') return { label, href: '/news', description }
  if (type === 'services') {
    // Тип «услуги» разворачивается вызывающей стороной, здесь только маркер
    return services.length > 0 ? { label, href: '/services', description } : null
  }

  const page = raw.page
  if (isRec(page)) {
    const slug = str(page.slug)
    const parent = isRec(page.parent) ? str(page.parent.slug) : undefined
    if (slug) return { label, href: parent ? `/${parent}/${slug}` : `/${slug}`, description }
  }
  return null
}

/**
 * Меню из CMS. Пункты со ссылкой «список услуг» разворачиваются в реальные
 * пункты из коллекции services — источник данных для меню и блока услуг один.
 */
export async function getNavigation(locale: Locale): Promise<readonly NavItem[]> {
  const services = await getServices(locale, { forMenu: true })

  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'menus',
      locale,
      where: { key: { equals: 'main' } },
      limit: 1,
      depth: 2,
    })
    const menu = res.docs[0]
    if (!isRec(menu) || !Array.isArray(menu.items)) return null

    const items: NavItem[] = []
    for (const rawItem of menu.items) {
      if (!isRec(rawItem)) continue
      const top = mapMenuLink(rawItem, services)
      if (!top) continue

      const children: { label: string; href: string; description?: string }[] = []
      const rawChildren = Array.isArray(rawItem.children) ? rawItem.children : []
      for (const rawChild of rawChildren) {
        if (!isRec(rawChild)) continue
        // Особый случай: подпункт-«список услуг» превращается в набор услуг
        if (str(rawChild.type) === 'services') {
          for (const service of services) {
            children.push({
              label: service.title,
              href: service.href,
              description: service.description,
            })
          }
          continue
        }
        const child = mapMenuLink(rawChild, services)
        if (child) children.push(child)
      }

      items.push({ ...top, children })
    }

    return items.length > 0 ? items : null
  })

  return result ?? getFallbackNavigation(locale)
}

/* ────────────────── Услуги и быстрые действия ────────────────── */

interface ServiceFilter {
  readonly forMenu?: boolean
  readonly forHome?: boolean
  readonly quickActions?: boolean
}

function mapService(raw: unknown): ServiceItem | null {
  if (!isRec(raw)) return null
  const title = str(raw.title)
  const href = str(raw.href)
  if (!title || !href) return null

  const icon = str(raw.icon) ?? 'application'
  return {
    id: id(raw.id) || href,
    title,
    description: str(raw.description),
    href,
    external: isExternal(href),
    icon: icon as ServiceItem['icon'],
  }
}

export async function getServices(
  locale: Locale,
  filter: ServiceFilter = { forHome: true },
): Promise<readonly ServiceItem[]> {
  const where: Rec = {}
  if (filter.forMenu) where.showInMenu = { equals: true }
  if (filter.forHome) where.showOnHome = { equals: true }
  if (filter.quickActions) where.isQuickAction = { equals: true }

  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'services',
      locale,
      where,
      sort: 'order',
      limit: 24,
      depth: 0,
    })
    const items = res.docs.map(mapService).filter((s): s is ServiceItem => s !== null)
    return items.length > 0 ? items : null
  })

  return result ?? getFallbackServices(locale)
}

/** Полоса быстрых действий: ровно четыре плитки. */
export async function getQuickActions(locale: Locale): Promise<readonly QuickAction[]> {
  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'services',
      locale,
      where: { isQuickAction: { equals: true } },
      sort: 'order',
      limit: 4,
      depth: 0,
    })
    const items = res.docs
      .map(mapService)
      .filter((s): s is ServiceItem => s !== null)
      .map<QuickAction>((s) => ({
        id: s.id,
        title: s.title,
        hint: s.description,
        href: s.href,
        external: s.external,
        icon: s.icon,
      }))
    return items.length > 0 ? items : null
  })

  return (result ?? getFallbackQuickActions(locale)).slice(0, 4)
}

/* ────────────────── Приёмная кампания ────────────────── */

export async function getAdmissionStages(
  locale: Locale,
  year = 2026,
): Promise<readonly AdmissionStage[]> {
  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'admission-stages',
      locale,
      where: { admissionYear: { equals: year } },
      sort: 'startDate',
      limit: 12,
      depth: 0,
    })

    const stages: AdmissionStage[] = []
    for (const raw of res.docs) {
      if (!isRec(raw)) continue
      const title = str(raw.title)
      const startDate = str(raw.startDate)
      if (!title || !startDate) continue
      stages.push({
        id: id(raw.id) || startDate,
        title,
        description: str(raw.description),
        startDate,
        endDate: str(raw.endDate),
        href: str(raw.link),
      })
    }
    return stages.length > 0 ? stages : null
  })

  return result ?? getFallbackStages(locale)
}

/* ────────────────── Новости ────────────────── */

function mapNews(raw: unknown): NewsItem | null {
  if (!isRec(raw)) return null
  const title = str(raw.title)
  const slug = str(raw.slug)
  if (!title || !slug) return null

  return {
    id: id(raw.id) || slug,
    slug,
    title,
    // Обрезка по границе слова на 140 символах — общее правило для всех карточек
    excerpt: truncateOnWord(str(raw.excerpt) ?? '', 140),
    publishedAt: str(raw.publishedAt) ?? str(raw.createdAt) ?? new Date().toISOString(),
    category: str(raw.category),
    cover: toImage(raw.cover, title),
    content: isRec(raw.content) && isRec(raw.content.root) ? (raw.content as RichTextValue) : undefined,
  }
}

export interface NewsPage {
  readonly items: readonly NewsItem[]
  readonly total: number
  readonly totalPages: number
}

export async function getNews(
  locale: Locale,
  { page = 1, limit = 9 }: { page?: number; limit?: number } = {},
): Promise<NewsPage> {
  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'news',
      locale,
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      page,
      limit,
      depth: 1,
    })
    const items = res.docs.map(mapNews).filter((n): n is NewsItem => n !== null)
    return items.length > 0
      ? { items, total: res.totalDocs, totalPages: res.totalPages }
      : null
  })

  if (result) return result

  const all = getFallbackNews(locale)
  const start = (page - 1) * limit
  return {
    items: all.slice(start, start + limit),
    total: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / limit)),
  }
}

export async function getNewsBySlug(
  locale: Locale,
  slug: string,
): Promise<NewsItem | null> {
  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'news',
      locale,
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      depth: 1,
    })
    return mapNews(res.docs[0])
  })

  return result ?? getFallbackNews(locale).find((n) => n.slug === slug) ?? null
}

/* ────────────────── Страницы ────────────────── */

export interface PageDoc {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly parentSlug?: string
  readonly parentTitle?: string
  readonly excerpt?: string
  readonly heroImage?: ImageAsset
  readonly seoTitle?: string
  readonly seoDescription?: string
  readonly noIndex: boolean
  readonly content?: RichTextValue
  readonly children: readonly { title: string; slug: string; excerpt?: string }[]
}

export async function getPage(
  locale: Locale,
  segments: readonly string[],
): Promise<PageDoc | null> {
  const slug = segments.at(-1)
  const parentSlug = segments.length > 1 ? segments.at(-2) : undefined
  if (!slug) return null

  return query(async (cms) => {
    const res = await cms.find({
      collection: 'pages',
      locale,
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      depth: 2,
    })
    const raw = res.docs[0]
    if (!isRec(raw)) return null

    const parent = isRec(raw.parent) ? raw.parent : undefined
    // Путь должен совпадать полностью: /institute/history ≠ /research/history
    if (parentSlug && str(parent?.slug) !== parentSlug) return null
    if (!parentSlug && parent) return null

    const title = str(raw.title) ?? slug
    const seo = isRec(raw.seo) ? raw.seo : {}

    const childrenRes = await cms.find({
      collection: 'pages',
      locale,
      where: { parent: { equals: raw.id }, status: { equals: 'published' } },
      sort: 'title',
      limit: 50,
      depth: 0,
    })

    return {
      id: id(raw.id),
      title,
      slug,
      parentSlug: str(parent?.slug),
      parentTitle: str(parent?.title),
      excerpt: str(raw.excerpt),
      heroImage: toImage(raw.heroImage, title),
      seoTitle: str(seo.title),
      seoDescription: str(seo.description),
      noIndex: bool(seo.noIndex),
      content: isRec(raw.content) && isRec(raw.content.root) ? (raw.content as RichTextValue) : undefined,
      children: childrenRes.docs.flatMap((child) => {
        if (!isRec(child)) return []
        const childTitle = str(child.title)
        const childSlug = str(child.slug)
        return childTitle && childSlug
          ? [{ title: childTitle, slug: childSlug, excerpt: str(child.excerpt) }]
          : []
      }),
    }
  })
}

/** Все опубликованные пути страниц — нужны sitemap.xml и статической генерации. */
export async function getAllPagePaths(
  locale: Locale,
): Promise<readonly { path: string; updatedAt: string }[]> {
  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'pages',
      locale,
      where: { status: { equals: 'published' } },
      limit: 500,
      depth: 1,
    })
    return res.docs.flatMap((raw) => {
      if (!isRec(raw)) return []
      const slug = str(raw.slug)
      if (!slug) return []
      const parent = isRec(raw.parent) ? str(raw.parent.slug) : undefined
      return [
        {
          path: parent ? `/${parent}/${slug}` : `/${slug}`,
          updatedAt: str(raw.updatedAt) ?? new Date().toISOString(),
        },
      ]
    })
  })

  if (result && result.length > 0) return result

  // Без базы карту сайта строим по демо-навигации
  const nav = getFallbackNavigation(locale)
  const now = new Date().toISOString()
  return nav.flatMap((item) => [
    { path: item.href, updatedAt: now },
    ...item.children.map((child) => ({ path: child.href, updatedAt: now })),
  ])
}

/* ────────────────── Партнёры, цифры, hero, контакты ────────────────── */

export async function getPartners(locale: Locale): Promise<readonly PartnerItem[]> {
  const result = await query(async (cms) => {
    const res = await cms.find({
      collection: 'partners',
      locale,
      sort: 'order',
      limit: 24,
      depth: 1,
    })
    const items: PartnerItem[] = []
    for (const raw of res.docs) {
      if (!isRec(raw)) continue
      const name = str(raw.name)
      const url = str(raw.url)
      const logo = toImage(raw.logo, name ?? '')
      if (!name || !url || !logo) continue
      items.push({ id: id(raw.id) || url, name, url, logo: { ...logo, alt: logo.alt || name } })
    }
    return items.length > 0 ? items : null
  })

  return result ?? getFallbackPartners(locale)
}

async function getHomepageGlobal(locale: Locale): Promise<Rec | null> {
  const result = await query(async (cms) => {
    const doc = await cms.findGlobal({ slug: 'homepage', locale, depth: 1 })
    return isRec(doc) ? doc : null
  })
  return result
}

export async function getHero(locale: Locale): Promise<HeroContent> {
  const doc = await getHomepageGlobal(locale)
  const hero = doc && isRec(doc.hero) ? doc.hero : null

  const title = hero ? str(hero.title) : undefined
  const subtitle = hero ? str(hero.subtitle) : undefined
  const image = hero ? toImage(hero.image, title ?? '') : undefined
  const ctaLabel = hero ? str(hero.ctaLabel) : undefined
  const ctaHref = hero ? str(hero.ctaHref) : undefined

  if (title && subtitle && image && ctaLabel && ctaHref) {
    return { title, subtitle, image, cta: { label: ctaLabel, href: ctaHref } }
  }
  return getFallbackHero(locale)
}

export async function getStats(locale: Locale): Promise<readonly StatItem[]> {
  const doc = await getHomepageGlobal(locale)
  const raw = doc && Array.isArray(doc.stats) ? doc.stats : []

  const stats: StatItem[] = []
  for (const item of raw) {
    if (!isRec(item)) continue
    const value = num(item.value)
    const label = str(item.label)
    if (value === undefined || !label) continue
    stats.push({ id: id(item.id) || label, value, label, suffix: str(item.suffix) })
  }

  return stats.length > 0 ? stats : getFallbackStats(locale)
}

export async function getContacts(locale: Locale): Promise<ContactBlock> {
  const result = await query(async (cms) => {
    const doc = await cms.findGlobal({ slug: 'site-settings', locale, depth: 1 })
    if (!isRec(doc)) return null

    const address = str(doc.address)
    if (!address) return null

    const map = isRec(doc.map) ? doc.map : {}
    const mapImage = toImage(map.image, address)
    const fallback = getFallbackContacts(locale)

    const phones = Array.isArray(doc.phones)
      ? doc.phones.flatMap((p) => (isRec(p) && str(p.value) ? [str(p.value) as string] : []))
      : []
    const emails = Array.isArray(doc.emails)
      ? doc.emails.flatMap((e) => (isRec(e) && str(e.value) ? [str(e.value) as string] : []))
      : []
    const socials = Array.isArray(doc.socials)
      ? doc.socials.flatMap((s) =>
          isRec(s) && str(s.label) && str(s.href)
            ? [{ label: str(s.label) as string, href: str(s.href) as string, external: true }]
            : [],
        )
      : []

    return {
      address,
      phones: phones.length > 0 ? phones : fallback.phones,
      emails: emails.length > 0 ? emails : fallback.emails,
      workingHours: str(doc.workingHours) ?? fallback.workingHours,
      transport: str(doc.transport) ?? fallback.transport,
      mapImage: mapImage ?? fallback.mapImage,
      mapYandexUrl: str(map.yandexUrl) ?? fallback.mapYandexUrl,
      mapGoogleUrl: str(map.googleUrl) ?? fallback.mapGoogleUrl,
      socials: socials.length > 0 ? socials : fallback.socials,
    }
  })

  return result ?? getFallbackContacts(locale)
}

export interface AnalyticsSettings {
  readonly provider: 'umami' | 'plausible' | 'none'
  readonly scriptUrl?: string
  readonly websiteId?: string
}

/**
 * Настройки счётчика. По умолчанию аналитики нет вовсе — её включает
 * редактор в админке, указав адрес собственного (self-hosted) сервера.
 */
export async function getAnalytics(): Promise<AnalyticsSettings> {
  const result = await query(async (cms) => {
    const doc = await cms.findGlobal({ slug: 'site-settings', depth: 0 })
    if (!isRec(doc) || !isRec(doc.analytics)) return null
    const raw = str(doc.analytics.provider)
    // Сравнение со строковыми литералами не сужает тип string, поэтому
    // допустимые значения перечисляем явно
    const provider: AnalyticsSettings['provider'] | null =
      raw === 'umami' ? 'umami' : raw === 'plausible' ? 'plausible' : null
    if (!provider) return null

    return {
      provider,
      scriptUrl: str(doc.analytics.scriptUrl),
      websiteId: str(doc.analytics.websiteId),
    } satisfies AnalyticsSettings
  })

  return result ?? { provider: 'none' }
}

/* ────────────────── Сборка главной страницы ────────────────── */

/**
 * Один вызов на всю главную: запросы идут параллельно, страница
 * пререндерится статически и обновляется по ISR (revalidate 300).
 */
export async function getHomeContent(locale: Locale): Promise<HomeContent> {
  const [hero, quickActions, admissionStages, news, stats, services, partners] =
    await Promise.all([
      getHero(locale),
      getQuickActions(locale),
      getAdmissionStages(locale),
      getNews(locale, { limit: 4 }),
      getStats(locale),
      getServices(locale, { forHome: true }),
      getPartners(locale),
    ])

  return {
    hero,
    quickActions,
    admissionStages,
    news: news.items,
    stats,
    services,
    partners,
  }
}

/* ────────────────── Поиск ────────────────── */

export interface SearchHit {
  readonly title: string
  readonly href: string
  readonly excerpt?: string
  readonly kind: 'page' | 'news' | 'service'
}

/**
 * Поиск по заголовкам и анонсам страниц, новостей и услуг.
 * Полнотекстовый индекс Postgres подключается отдельной миграцией;
 * для текущего объёма контента достаточно like-запроса.
 */
export async function searchContent(
  locale: Locale,
  rawQuery: string,
): Promise<readonly SearchHit[]> {
  const q = rawQuery.trim()
  if (q.length < 2) return []

  const result = await query(async (cms) => {
    const [pages, news, services] = await Promise.all([
      cms.find({
        collection: 'pages',
        locale,
        where: {
          status: { equals: 'published' },
          or: [{ title: { like: q } }, { excerpt: { like: q } }],
        },
        limit: 10,
        depth: 1,
      }),
      cms.find({
        collection: 'news',
        locale,
        where: {
          status: { equals: 'published' },
          or: [{ title: { like: q } }, { excerpt: { like: q } }],
        },
        limit: 10,
        depth: 0,
      }),
      cms.find({
        collection: 'services',
        locale,
        where: { title: { like: q } },
        limit: 10,
        depth: 0,
      }),
    ])

    const hits: SearchHit[] = []

    for (const raw of pages.docs) {
      if (!isRec(raw)) continue
      const title = str(raw.title)
      const slug = str(raw.slug)
      if (!title || !slug) continue
      const parent = isRec(raw.parent) ? str(raw.parent.slug) : undefined
      hits.push({
        title,
        href: parent ? `/${parent}/${slug}` : `/${slug}`,
        excerpt: str(raw.excerpt),
        kind: 'page',
      })
    }
    for (const raw of news.docs) {
      const item = mapNews(raw)
      if (item) hits.push({ title: item.title, href: `/news/${item.slug}`, excerpt: item.excerpt, kind: 'news' })
    }
    for (const raw of services.docs) {
      const item = mapService(raw)
      if (item) hits.push({ title: item.title, href: item.href, excerpt: item.description, kind: 'service' })
    }

    return hits
  })

  if (result) return result

  // Резервный поиск по демо-контенту
  const needle = q.toLowerCase()
  const nav = getFallbackNavigation(locale)
  const hits: SearchHit[] = []
  for (const item of nav) {
    if (item.label.toLowerCase().includes(needle)) {
      hits.push({ title: item.label, href: item.href, kind: 'page' })
    }
    for (const child of item.children) {
      if (child.label.toLowerCase().includes(needle)) {
        hits.push({ title: child.label, href: child.href, kind: 'page' })
      }
    }
  }
  for (const item of getFallbackNews(locale)) {
    if (item.title.toLowerCase().includes(needle) || item.excerpt.toLowerCase().includes(needle)) {
      hits.push({ title: item.title, href: `/news/${item.slug}`, excerpt: item.excerpt, kind: 'news' })
    }
  }
  for (const item of getFallbackServices(locale)) {
    if (item.title.toLowerCase().includes(needle)) {
      hits.push({ title: item.title, href: item.href, kind: 'service' })
    }
  }
  return hits
}
