import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { ExternalIcon } from './ServiceIcon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse'

const VARIANTS: Record<Variant, string> = {
  // Заливка терракотой затемнённого оттенка: белый текст даёт 5.58:1
  primary:
    'bg-action text-white hover:bg-action-hover border border-transparent hc-invert-text',
  secondary:
    'bg-surface text-ink-brand border border-edge-strong hover:border-brand',
  ghost: 'text-ink-brand underline underline-offset-4 hover:text-ink-accent',
  inverse:
    'bg-white text-ink-brand border border-transparent hover:bg-sand hc-invert-text',
}

interface ActionLinkProps {
  readonly href: string
  readonly children: ReactNode
  readonly variant?: Variant
  readonly external?: boolean
  readonly className?: string
  /** Дополнительное пояснение для скринридера, если подпись слишком общая */
  readonly ariaLabel?: string
}

/**
 * Ссылка-кнопка. Внешние адреса открываются в новой вкладке и всегда
 * помечены иконкой + текстом в aria-label: пользователь должен понимать,
 * что уходит с сайта, до клика.
 */
export function ActionLink({
  href,
  children,
  variant = 'primary',
  external,
  className = '',
  ariaLabel,
}: ActionLinkProps) {
  const isExternal = external ?? /^https?:\/\//i.test(href)
  const base =
    'inline-flex items-center justify-center gap-2 rounded px-5 py-3 text-base font-medium transition-colors'

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={`${base} ${VARIANTS[variant]} ${className}`}
      >
        {children}
        <ExternalIcon className="h-4 w-4" />
      </a>
    )
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
