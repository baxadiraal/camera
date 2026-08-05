/**
 * Первичное наполнение CMS.
 *
 * Заливает в базу тот же контент, на котором сайт работает без базы
 * (src/lib/fallback-content.ts): меню из пяти разделов, страницы-хабы с
 * подстраницами, интерактивные услуги, этапы приёма 2026, новости,
 * партнёров, контакты и цифры института.
 *
 * Скрипт идемпотентен: повторный запуск обновляет уже созданные документы
 * по slug, а не плодит дубли.
 *
 * Запуск:  npm run payload run scripts/seed.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Where } from 'payload'
import config from '../src/payload.config'
import { routing, type Locale } from '../src/i18n/routing'
import {
  CONTACTS_SEED,
  HERO_SEED,
  NAV_SEED,
  NEWS_SEED,
  PARTNERS_SEED,
  SERVICES_SEED,
  STAGES_SEED,
  STATS_SEED,
} from '../src/lib/fallback-content'
import { toSlug } from '../src/lib/slugify'

type L10n = Readonly<Record<Locale, string>>

const payload = await getPayload({ config })

type SeedCollection =
  | 'pages'
  | 'news'
  | 'services'
  | 'admission-stages'
  | 'partners'
  | 'media'
  | 'menus'

/**
 * Local API перегружен под каждую коллекцию (черновики, select, populate),
 * а сид работает с любой из них единообразно. Сужаем сигнатуры один раз здесь,
 * чтобы дальше по скрипту не разбираться с перегрузками.
 */
const api = {
  find: payload.find as unknown as (args: {
    collection: SeedCollection
    where?: Where
    limit?: number
    locale?: Locale
  }) => Promise<{ docs: { id: string | number }[] }>,
  create: payload.create as unknown as (args: {
    collection: SeedCollection
    data: Record<string, unknown>
    locale?: Locale
    filePath?: string
  }) => Promise<{ id: string | number }>,
  update: payload.update as unknown as (args: {
    collection: SeedCollection
    id: string | number
    data: Record<string, unknown>
    locale?: Locale
  }) => Promise<{ id: string | number }>,
  updateGlobal: payload.updateGlobal as unknown as (args: {
    slug: 'site-settings' | 'homepage'
    data: Record<string, unknown>
    locale?: Locale
  }) => Promise<unknown>,
}

/** Находит документ по slug либо создаёт новый, затем дописывает переводы. */
async function upsertLocalized<T extends Record<string, unknown>>(
  collection: SeedCollection,
  where: Where,
  buildData: (locale: Locale) => T,
): Promise<string | number> {
  const existing = await api.find({ collection, where, limit: 1, locale: routing.defaultLocale })
  const first = existing.docs[0] as { id: string | number } | undefined

  let id: string | number
  if (first) {
    id = first.id
    await api.update({
      collection,
      id,
      data: buildData(routing.defaultLocale),
      locale: routing.defaultLocale,
    })
  } else {
    const created = await api.create({
      collection,
      data: buildData(routing.defaultLocale),
      locale: routing.defaultLocale,
    })
    id = (created as { id: string | number }).id
  }

  // Остальные локали дописываются отдельными обновлениями
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue
    await api.update({ collection, id, data: buildData(locale), locale })
  }

  // Идентификатор возвращается как есть: в Postgres это число,
  // и приведение к строке сломало бы валидацию связей
  return id
}

const pick = (value: L10n, locale: Locale) => value[locale]

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Загружает файл-заготовку в медиатеку (если его там ещё нет) и проставляет
 * локализованный alt. Реальные фотографии редактор потом заменит в админке,
 * подписи останутся.
 */
async function upsertMedia(relativePath: string, alt: L10n): Promise<string | number | null> {
  const filename = path.basename(relativePath)
  const existing = await api.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  const first = existing.docs[0] as { id: string | number } | undefined
  if (first) {
    for (const locale of routing.locales) {
      await api.update({
        collection: 'media',
        id: first.id,
        data: { alt: pick(alt, locale) },
        locale,
      })
    }
    return first.id
  }

  try {
    const created = await api.create({
      collection: 'media',
      data: { alt: pick(alt, routing.defaultLocale) },
      filePath: path.join(projectRoot, relativePath),
      locale: routing.defaultLocale,
    })
    const id = (created as { id: string | number }).id
    for (const locale of routing.locales) {
      if (locale === routing.defaultLocale) continue
      await api.update({ collection: 'media', id, data: { alt: pick(alt, locale) }, locale })
    }
    return id
  } catch (error) {
    payload.logger.warn(`Не удалось загрузить ${relativePath}: ${String(error)}`)
    return null
  }
}

async function seed(): Promise<void> {
  payload.logger.info('Наполнение базы демо-контентом…')

  /* Страницы: сначала хабы, затем их дети */
  const hubIds = new Map<string, string | number>()

  for (const item of NAV_SEED) {
    const slug = item.href.replace(/^\//, '')
    const id = await upsertLocalized('pages', { slug: { equals: slug } }, (locale) => ({
      title: pick(item.label, locale),
      slug,
      status: 'published',
      showChildrenIndex: true,
    }))
    hubIds.set(slug, id)
  }

  const childIds = new Map<string, string | number>()

  for (const item of NAV_SEED) {
    const parentSlug = item.href.replace(/^\//, '')
    const parentId = hubIds.get(parentSlug)
    for (const child of item.children) {
      const childSlug = child.href.split('/').filter(Boolean).slice(-1)[0]
      if (!childSlug) continue
      const childId = await upsertLocalized('pages', { slug: { equals: childSlug } }, (locale) => ({
        title: pick(child.label, locale),
        slug: childSlug,
        parent: parentId,
        status: 'published',
      }))
      childIds.set(child.href, childId)
    }
  }

  /* Интерактивные услуги — единый источник для меню, главной и быстрых действий */
  for (const [index, service] of SERVICES_SEED.entries()) {
    await upsertLocalized('services', { slug: { equals: toSlug(service.id) } }, (locale) => ({
      title: pick(service.title, locale),
      slug: toSlug(service.id),
      description: service.description ? pick(service.description, locale) : undefined,
      href: service.href,
      icon: service.icon,
      showOnHome: service.showOnHome,
      showInMenu: service.showInMenu,
      isQuickAction: service.quickAction,
      order: (index + 1) * 10,
    }))
  }

  /* Этапы приёмной кампании */
  for (const [index, stage] of STAGES_SEED.entries()) {
    await upsertLocalized(
      'admission-stages',
      { and: [{ admissionYear: { equals: 2026 } }, { startDate: { equals: stage.startDate } }] },
      (locale) => ({
        title: pick(stage.title, locale),
        description: pick(stage.description, locale),
        startDate: stage.startDate,
        endDate: stage.endDate,
        admissionYear: 2026,
        link: stage.href,
        order: (index + 1) * 10,
      }),
    )
  }

  /* Новости */
  for (const item of NEWS_SEED) {
    await upsertLocalized('news', { slug: { equals: item.slug } }, (locale) => ({
      title: pick(item.title, locale),
      slug: item.slug,
      excerpt: pick(item.excerpt, locale),
      publishedAt: item.publishedAt,
      status: 'published',
      category: 'institute',
    }))
  }

  /* Медиатека: заготовки изображений с готовыми alt на четырёх языках */
  const heroImageId = await upsertMedia('public/media/hero-institute.jpg', HERO_SEED.image.alt)
  const mapImageId = await upsertMedia('public/media/map-nukus.png', CONTACTS_SEED.mapImage.alt)

  /* Партнёры: логотип обязателен, поэтому сначала грузим файл в медиатеку */
  for (const [index, partner] of PARTNERS_SEED.entries()) {
    const logoId = await upsertMedia(`public${partner.logo}`, partner.name)
    if (!logoId) continue
    await upsertLocalized('partners', { url: { equals: partner.url } }, (locale) => ({
      name: pick(partner.name, locale),
      url: partner.url,
      logo: logoId,
      order: (index + 1) * 10,
    }))
  }

  /* Глобальные настройки */
  for (const locale of routing.locales) {
    await api.updateGlobal({
      slug: 'site-settings',
      locale,
      data: {
        organizationName:
          locale === 'ru'
            ? 'Нукусский филиал Узбекского государственного института искусств и культуры'
            : 'Ózbekstan mámleketlik kórkem óner hám mádeniyat institutı Nókis filialı',
        address: pick(CONTACTS_SEED.address, locale),
        transport: pick(CONTACTS_SEED.transport, locale),
        workingHours: pick(CONTACTS_SEED.workingHours, locale),
        phones: CONTACTS_SEED.phones.map((value) => ({ value })),
        emails: CONTACTS_SEED.emails.map((value) => ({ value })),
        socials: CONTACTS_SEED.socials.map((social) => ({
          label: social.label,
          href: social.href,
        })),
        map: {
          image: mapImageId ?? undefined,
          yandexUrl: CONTACTS_SEED.mapYandexUrl,
          googleUrl: CONTACTS_SEED.mapGoogleUrl,
        },
        analytics: { provider: 'none' },
      },
    })

    await api.updateGlobal({
      slug: 'homepage',
      locale,
      data: {
        hero: {
          title: pick(HERO_SEED.title, locale),
          subtitle: pick(HERO_SEED.subtitle, locale),
          ctaLabel: pick(HERO_SEED.ctaLabel, locale),
          ctaHref: HERO_SEED.ctaHref,
          image: heroImageId ?? undefined,
        },
        stats: STATS_SEED.map((stat) => ({
          value: stat.value,
          label: pick(stat.label, locale),
          suffix: stat.suffix,
        })),
        admissionYear: 2026,
      },
    })
  }

  /* Главное меню */
  const menus = await api.find({ collection: 'menus', where: { key: { equals: 'main' } }, limit: 1 })
  const menuData = (locale: Locale) => ({
    title: 'Главное меню',
    key: 'main' as const,
    items: NAV_SEED.map((item) => ({
      label: pick(item.label, locale),
      type: 'page' as const,
      page: hubIds.get(item.href.replace(/^\//, '')),
      children: item.children.map((child) => ({
        label: pick(child.label, locale),
        type: 'page' as const,
        // Подпункт ссылается на реальную страницу — «пустых» ссылок в меню нет
        page: childIds.get(child.href),
      })),
    })),
  })

  const menuId =
    (menus.docs[0] as { id: string | number } | undefined)?.id ??
    (await api.create({ collection: 'menus', data: menuData(routing.defaultLocale) })).id

  for (const locale of routing.locales) {
    await api.update({ collection: 'menus', id: menuId, data: menuData(locale), locale })
  }

  payload.logger.info('Готово. Загрузите фотографии и логотипы в медиатеку через админку.')
}

await seed()
process.exit(0)
