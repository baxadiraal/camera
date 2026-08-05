import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Локализованные обёртки над next/navigation.
 * Компоненты импортируют Link отсюда — префикс локали подставляется сам.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
