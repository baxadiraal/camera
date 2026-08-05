'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import type { NavItem } from '@/types/content'

interface MegaMenuProps {
  readonly items: readonly NavItem[]
}

/**
 * Горизонтальное меню с выпадающими панелями второго уровня (десктоп).
 *
 * Клавиатура:
 *   Enter/Space — открыть панель, Escape — закрыть и вернуть фокус на кнопку,
 *   Tab уводит фокус из панели и автоматически её закрывает,
 *   ← → переключают разделы верхнего уровня.
 *
 * Каждый родительский пункт — одновременно кнопка раскрытия и ссылка на
 * реальную страницу-хаб: ссылка на «#» в системе не предусмотрена вовсе.
 */
export function MegaMenu({ items }: MegaMenuProps) {
  const t = useTranslations('header')
  const pathname = usePathname()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLUListElement>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  const close = useCallback((focusTrigger = false) => {
    setOpenIndex((current) => {
      if (focusTrigger && current !== null) triggerRefs.current[current]?.focus()
      return null
    })
  }, [])

  // Закрываем панель по клику вне меню и по Escape
  useEffect(() => {
    if (openIndex === null) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openIndex, close])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const onTriggerKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const delta = event.key === 'ArrowRight' ? 1 : -1
      const next = (index + delta + items.length) % items.length
      triggerRefs.current[next]?.focus()
      setOpenIndex((current) => (current === null ? null : next))
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpenIndex(index)
    }
  }

  return (
    <ul ref={containerRef} className="flex items-stretch gap-1">
      {items.map((item, index) => {
        const panelId = `${baseId}-panel-${index}`
        const hasChildren = item.children.length > 0
        const active = isActive(item.href)
        const expanded = openIndex === index

        return (
          <li
            key={item.href}
            className="relative"
            onMouseEnter={() => hasChildren && setOpenIndex(index)}
            onMouseLeave={() => hasChildren && close()}
          >
            <div className="flex items-center">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded px-3 py-4 text-base font-medium transition-colors ${
                  active
                    ? 'text-ink-accent'
                    : 'text-ink-brand hover:text-ink-accent'
                }`}
              >
                {item.label}
              </Link>

              {hasChildren && (
                <button
                  type="button"
                  ref={(node) => {
                    triggerRefs.current[index] = node
                  }}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  aria-label={t('submenuFor', { section: item.label })}
                  onClick={() => setOpenIndex(expanded ? null : index)}
                  onKeyDown={(event) => onTriggerKeyDown(event, index)}
                  className="rounded p-1 text-ink-muted transition-colors hover:text-ink-accent"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            {hasChildren && (
              <div
                id={panelId}
                hidden={!expanded}
                className="absolute left-0 top-full z-50 w-[min(92vw,640px)] rounded border border-edge bg-surface p-4 shadow-lifted"
              >
                <ul className="grid grid-cols-2 gap-1">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <li key={`${child.href}-${child.label}`}>
                        <Link
                          href={child.href}
                          aria-current={childActive ? 'page' : undefined}
                          onClick={() => close()}
                          className={`block rounded px-3 py-2 text-base transition-colors ${
                            childActive
                              ? 'bg-surface-muted text-ink-accent'
                              : 'text-ink hover:bg-surface-muted hover:text-ink-brand'
                          }`}
                        >
                          {child.label}
                          {child.description && (
                            <span className="mt-0.5 block text-sm text-ink-muted">
                              {child.description}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
