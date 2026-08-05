import type { Locale } from '@/i18n/routing'

/**
 * Доменные типы фронтенда.
 * Компоненты знают только о них: CMS-документы Payload приводятся к этим
 * структурам в src/lib/cms.ts. Так вёрстка не зависит от схемы админки
 * и одинаково работает и с живой базой, и с резервным контентом.
 */

/** Изображение из медиатеки. alt обязателен — картинок без alt в системе нет. */
export interface ImageAsset {
  readonly url: string
  readonly alt: string
  readonly width: number
  readonly height: number
  /** base64-заглушка для placeholder="blur"; при отсутствии — плавный фон */
  readonly blurDataURL?: string
}

export interface LinkTarget {
  readonly label: string
  /** Внутренний путь без префикса локали («/qabillaw») либо абсолютный URL */
  readonly href: string
  readonly external?: boolean
}

/** Пункт меню. Ровно два уровня: у детей children уже нет. */
export interface NavChild extends LinkTarget {
  readonly description?: string
}

export interface NavItem extends LinkTarget {
  readonly children: readonly NavChild[]
}

export type ServiceIcon =
  | 'application'
  | 'hemis'
  | 'payment'
  | 'schedule'
  | 'library'
  | 'dormitory'
  | 'certificate'
  | 'appeal'
  | 'scholarship'
  | 'support'

export interface ServiceItem {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly href: string
  readonly external: boolean
  readonly icon: ServiceIcon
}

export interface QuickAction {
  readonly id: string
  readonly title: string
  readonly hint?: string
  readonly href: string
  readonly external: boolean
  readonly icon: ServiceIcon
}

export type AdmissionStatus = 'past' | 'current' | 'future'

export interface AdmissionStage {
  readonly id: string
  readonly title: string
  readonly description?: string
  /** ISO-даты; конец может отсутствовать у одномоментных этапов */
  readonly startDate: string
  readonly endDate?: string
  readonly href?: string
}

export interface AdmissionStageView extends AdmissionStage {
  readonly status: AdmissionStatus
}

/**
 * Редакторский текст в формате Lexical. Фронтенду важна только структура
 * дерева узлов — конкретные поля разбирает компонент RichText.
 */
export interface LexicalNode {
  readonly type?: string
  readonly tag?: string
  readonly text?: string
  readonly format?: number | string
  readonly listType?: string
  readonly fields?: { readonly url?: string; readonly newTab?: boolean }
  readonly children?: readonly LexicalNode[]
}

export interface RichTextValue {
  readonly root?: LexicalNode
}

export interface NewsItem {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly excerpt: string
  readonly publishedAt: string
  readonly category?: string
  readonly cover?: ImageAsset
  /** Полный текст: заполняется только на странице самой новости */
  readonly content?: RichTextValue
}

export interface StatItem {
  readonly id: string
  readonly value: number
  readonly label: string
  /** Суффикс вроде «+» или «%», выводится после числа */
  readonly suffix?: string
}

export interface PartnerItem {
  readonly id: string
  readonly name: string
  readonly url: string
  readonly logo: ImageAsset
}

export interface HeroContent {
  readonly title: string
  readonly subtitle: string
  readonly cta: LinkTarget
  readonly image: ImageAsset
}

export interface ContactBlock {
  readonly address: string
  readonly phones: readonly string[]
  readonly emails: readonly string[]
  readonly workingHours: string
  readonly transport: string
  readonly mapImage: ImageAsset
  readonly mapYandexUrl: string
  readonly mapGoogleUrl: string
  readonly socials: readonly LinkTarget[]
}

export interface HomeContent {
  readonly hero: HeroContent
  readonly quickActions: readonly QuickAction[]
  readonly admissionStages: readonly AdmissionStage[]
  readonly news: readonly NewsItem[]
  readonly stats: readonly StatItem[]
  readonly services: readonly ServiceItem[]
  readonly partners: readonly PartnerItem[]
}

export interface PageSeo {
  readonly title: string
  readonly description: string
}

export interface CmsQuery {
  readonly locale: Locale
}
