import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Все настройки локализации живут в routing.ts — здесь только подключение
export default createMiddleware(routing)

export const config = {
  /**
   * Локализуем только публичные страницы.
   * Из-под middleware выведены: админка Payload (/admin), REST и GraphQL API,
   * служебные маршруты Next, файлы медиатеки и статика с расширением.
   */
  matcher: [
    '/((?!admin|api|_next|_vercel|media|fonts|images|.*\\..*).*)',
  ],
}
