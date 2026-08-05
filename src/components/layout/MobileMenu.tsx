'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import type { NavItem } from '@/types/content'
import { LangSwitcher } from './LangSwitcher'

interface MobileMenuProps {
  readonly items: readonly NavItem[]
  readonly ctaLabel: string
  readonly ctaHref: string
}

/**
 * Мобильная навигация: бургер и полноэкранная панель.
 *
 * Панель проходима с клавиатуры: фокус уходит внутрь при открытии,
 * Tab закольцован внутри панели, Escape закрывает и возвращает фокус
 * на кнопку-бургер. Пока панель открыта, фон не скроллится.
 */
export function MobileMenu({ items, ctaLabel, ctaHref }: MobileMenuProps) {
  const t = useTranslations('header')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  // Закрываем панель при переходе на другую страницу
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return

    const panel = panelRef.current
    if (!panel) return

    document.body.style.overflow = 'hidden'
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    )
    focusable[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || focusable.length === 0) return

      // Кольцевой обход фокуса внутри панели
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={t('openMenu')}
        className="inline-flex h-11 w-11 items-center justify-center rounded border border-edge text-ink-brand lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label={t('mainNav')}
        // display задаётся классом: у атрибута hidden значение display:none
        // из браузерных стилей, и любой utility-класс с display его перебил бы
        className={`fixed inset-0 z-[90] flex-col bg-surface lg:hidden ${
          isOpen ? 'flex' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <LangSwitcher />
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              buttonRef.current?.focus()
            }}
            aria-label={t('closeMenu')}
            className="inline-flex h-11 w-11 items-center justify-center rounded border border-edge text-ink-brand"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav aria-label={t('mainNav')} className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const isSectionOpen = expanded === item.href
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href} className="border-b border-edge pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex-1 rounded px-2 py-3 text-lg font-medium ${
                        active ? 'text-ink-accent' : 'text-ink-brand'
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isSectionOpen ? null : item.href)}
                        aria-expanded={isSectionOpen}
                        aria-label={t('submenuFor', { section: item.label })}
                        className="inline-flex h-11 w-11 items-center justify-center rounded text-ink-muted"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className={`h-5 w-5 transition-transform ${isSectionOpen ? 'rotate-180' : ''}`}
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

                  {item.children.length > 0 && isSectionOpen && (
                    <ul className="mb-2 ml-2 flex flex-col gap-0.5 border-l-2 border-accent pl-3">
                      {item.children.map((child) => (
                        <li key={`${child.href}-${child.label}`}>
                          <Link
                            href={child.href}
                            aria-current={pathname === child.href ? 'page' : undefined}
                            className="block rounded px-2 py-2.5 text-base text-ink"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-edge p-4">
          <Link
            href={ctaHref}
            className="flex items-center justify-center rounded bg-action px-5 py-3 text-base font-medium text-white hc-invert-text"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </>
  )
}
