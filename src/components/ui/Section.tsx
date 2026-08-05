import type { ReactNode } from 'react'

interface SectionProps {
  readonly children: ReactNode
  /** Песочная подложка чередует секции, не добавляя рамок и теней */
  readonly tone?: 'default' | 'sand' | 'brand'
  readonly className?: string
  /** id нужен для якорей и aria-labelledby */
  readonly id?: string
  readonly labelledBy?: string
}

const TONES: Record<NonNullable<SectionProps['tone']>, string> = {
  default: 'bg-surface',
  sand: 'bg-surface-muted',
  brand: 'bg-surface-inverse text-ink-inverse',
}

export function Section({
  children,
  tone = 'default',
  className = '',
  id,
  labelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${TONES[tone]} py-12 md:py-18 ${className}`}
    >
      <div className="container-page">{children}</div>
    </section>
  )
}

interface SectionHeaderProps {
  readonly id: string
  readonly title: string
  readonly subtitle?: string
  /** Ссылка «все …» справа от заголовка */
  readonly action?: ReactNode
  readonly inverse?: boolean
}

export function SectionHeader({
  id,
  title,
  subtitle,
  action,
  inverse = false,
}: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-prose">
        <h2
          id={id}
          className={`text-h3 md:text-h2 ${inverse ? 'text-ink-inverse' : 'text-ink-brand'}`}
        >
          {title}
        </h2>
        {/* У семантических токенов нет модификатора прозрачности: их значение —
            CSS-переменная, поэтому оттенки задаются отдельными токенами */}
        {subtitle && (
          <p className={`mt-3 text-lg ${inverse ? 'text-ink-inverse' : 'text-ink-muted'}`}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
