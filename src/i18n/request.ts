import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

/**
 * Конфиг запроса next-intl: подгружает словарь UI-строк для активной локали.
 * Контент (новости, страницы, меню) приходит из CMS — здесь только интерфейс.
 * Даты форматируются утилитой formatDate (см. src/lib/format.ts): у каракалпакской
 * локали нет данных ICU, поэтому там подставляется uz-Latn-UZ.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Asia/Tashkent',
    onError(error) {
      // В проде молча деградируем до ключа, чтобы не ронять страницу
      if (process.env.NODE_ENV !== 'production') console.error(error)
    },
    getMessageFallback({ key }) {
      return key
    },
  }
})
