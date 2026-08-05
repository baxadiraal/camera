import { localeIntlTag, type Locale } from '@/i18n/routing'

/**
 * Форматирование даты для конкретной локали.
 * У каракалпакского нет данных в ICU, поэтому подставляем uz-Latn-UZ —
 * названия месяцев в узбекской латинице читаются носителями каракалпакского.
 */
export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(localeIntlTag[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Tashkent',
  }).format(date)
}

/** Короткая дата вида 05.08.2026 — для таймлайна и списков. */
export function formatShortDate(iso: string, locale: Locale): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(localeIntlTag[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Tashkent',
  }).format(date)
}

/** Диапазон дат этапа: «12.06.2026 — 30.06.2026» либо одна дата. */
export function formatDateRange(
  start: string,
  end: string | undefined,
  locale: Locale,
): string {
  const from = formatShortDate(start, locale)
  if (!end) return from
  const to = formatShortDate(end, locale)
  return from === to ? from : `${from} — ${to}`
}

/** Число с разрядами: 1 240 вместо 1240. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeIntlTag[locale]).format(value)
}

/**
 * Обрезка анонса по границе слова.
 * Требование ТЗ: excerpt новостей — не более 140 символов, без разрыва слова.
 */
export function truncateOnWord(text: string, limit = 140): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean

  const head = clean.slice(0, limit + 1)
  const lastSpace = head.lastIndexOf(' ')
  const cut = lastSpace > limit * 0.5 ? head.slice(0, lastSpace) : clean.slice(0, limit)
  return `${cut.replace(/[,.;:!?—–-]+$/, '')}…`
}
