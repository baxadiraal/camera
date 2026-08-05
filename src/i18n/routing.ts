import { defineRouting } from 'next-intl/routing'

/**
 * Локали сайта. Дефолт — каракалпакская латиница (qq).
 * localePrefix: 'always' — у всех локалей есть префикс (/qq, /uz, /ru, /en),
 * так что каждая языковая версия имеет собственный канонический URL,
 * а x-default указывает на локаль по умолчанию.
 *
 * alternateLinks: false — заголовок Link с alternate-версиями отключён:
 * hreflang собирается в generateMetadata (src/lib/seo.ts), где каракалпакская
 * версия помечена корректным кодом kaa. Код в URL (qq) лежит в частном
 * диапазоне BCP-47 и в hreflang попадать не должен, а два разных набора
 * альтернатив противоречили бы друг другу.
 */
export const routing = defineRouting({
  locales: ['qq', 'uz', 'ru', 'en'],
  defaultLocale: 'qq',
  localePrefix: 'always',
  alternateLinks: false,
})

export type Locale = (typeof routing.locales)[number]

/** Подписи переключателя языка — текстом, без флагов (флаг ≠ язык). */
export const localeLabels: Record<Locale, string> = {
  qq: 'QQ',
  uz: 'UZ',
  ru: 'RU',
  en: 'EN',
}

/** Полные названия языков — для aria-label и карты сайта. */
export const localeNames: Record<Locale, string> = {
  qq: 'Qaraqalpaqsha',
  uz: 'Oʻzbekcha',
  ru: 'Русский',
  en: 'English',
}

/** Значения для атрибутов lang / hreflang. */
export const localeHtmlLang: Record<Locale, string> = {
  qq: 'kaa',
  uz: 'uz',
  ru: 'ru',
  en: 'en',
}

/** Локаль для форматирования дат (для каракалпакской нет ICU-данных — берём uz). */
export const localeIntlTag: Record<Locale, string> = {
  qq: 'uz-Latn-UZ',
  uz: 'uz-Latn-UZ',
  ru: 'ru-RU',
  en: 'en-GB',
}

export const localeOpenGraph: Record<Locale, string> = {
  qq: 'uz_UZ',
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
}
