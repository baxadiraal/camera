import type { routing } from '@/i18n/routing'
import type messages from './messages/ru.json'

/**
 * Строгая типизация next-intl: ключи словаря и список локалей известны
 * компилятору, поэтому опечатка в t('news.titel') не доживёт до рантайма.
 * За эталон структуры берётся русский словарь — остальные обязаны совпадать.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}
