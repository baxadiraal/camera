'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'

/**
 * Диалог поиска.
 *
 * Сам поиск выполняется на сервере (/search?q=…) — клиенту не нужен ни
 * индекс, ни лишний JS. Диалог только собирает запрос: открывается по кнопке
 * и по Ctrl/⌘+K, закрывается по Escape, фокус возвращается на кнопку.
 */
export function SearchDialog() {
  const t = useTranslations('search')
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dialogId = useId()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const query = value.trim()
    if (query.length < 2) return
    setIsOpen(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls={dialogId}
        aria-label={t('openDialog')}
        className="inline-flex h-11 w-11 items-center justify-center rounded border border-edge text-ink-brand transition-colors hover:border-brand"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>

      <div
        id={dialogId}
        hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className="fixed inset-0 z-[95] bg-graphite/60 p-4 pt-24"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false)
        }}
      >
        <div className="mx-auto w-full max-w-2xl rounded bg-surface p-6 shadow-lifted">
          <form onSubmit={submit} role="search">
            <label htmlFor={`${dialogId}-input`} className="block text-lg font-medium text-ink-brand">
              {t('title')}
            </label>
            <div className="mt-3 flex gap-2">
              <input
                id={`${dialogId}-input`}
                ref={inputRef}
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={t('placeholder')}
                aria-label={t('queryLabel')}
                aria-describedby={`${dialogId}-hint`}
                className="w-full rounded border border-edge-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted"
              />
              <button
                type="submit"
                className="rounded bg-action px-5 py-3 text-base font-medium text-white hc-invert-text"
              >
                {t('submit')}
              </button>
            </div>
            <p id={`${dialogId}-hint`} className="mt-3 text-sm text-ink-muted">
              {t('hint')}
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
