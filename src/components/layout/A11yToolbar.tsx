'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { useTranslations } from 'next-intl'

/** Ключ в localStorage и форма хранимого состояния. */
const STORAGE_KEY = 'a11y-preferences'

interface A11yState {
  readonly font: 0 | 1 | 2 | 3
  readonly contrast: boolean
  readonly images: boolean
}

const DEFAULT_STATE: A11yState = { font: 0, contrast: false, images: true }

/**
 * Скрипт применяет сохранённые настройки до первой отрисовки — иначе страница
 * успевала бы мигнуть обычной версией. Вставляется в <head> как есть.
 */
export const A11Y_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}');var r=document.documentElement;if(s.font)r.setAttribute('data-a11y-font',String(s.font));if(s.contrast)r.setAttribute('data-a11y-contrast','on');if(s.images===false)r.setAttribute('data-a11y-images','off')}catch(e){}})()`

function apply(state: A11yState): void {
  const root = document.documentElement
  if (state.font > 0) root.setAttribute('data-a11y-font', String(state.font))
  else root.removeAttribute('data-a11y-font')

  if (state.contrast) root.setAttribute('data-a11y-contrast', 'on')
  else root.removeAttribute('data-a11y-contrast')

  if (!state.images) root.setAttribute('data-a11y-images', 'off')
  else root.removeAttribute('data-a11y-images')
}

/**
 * Тулбар «Версия для слабовидящих»: три шага размера шрифта, высокий контраст
 * и отключение изображений. Состояние переживает перезагрузку (localStorage).
 *
 * Сами режимы реализованы в CSS через атрибуты на <html>, поэтому компоненты
 * страницы о них ничего не знают и не перерисовываются.
 */
export function A11yToolbar() {
  const t = useTranslations('a11y')
  const [state, setState] = useState<A11yState>(DEFAULT_STATE)
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()

  // Поднимаем сохранённые настройки в React-состояние после гидратации
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setState({ ...DEFAULT_STATE, ...(JSON.parse(stored) as Partial<A11yState>) })
    } catch {
      // Приватный режим браузера — работаем со значениями по умолчанию
    }
  }, [])

  const update = useCallback((patch: Partial<A11yState>) => {
    setState((current) => {
      const next = { ...current, ...patch }
      apply(next)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Запись может быть запрещена — настройки просто не переживут перезагрузку
      }
      return next
    })
  }, [])

  const fontSteps: readonly { value: A11yState['font']; label: string }[] = [
    { value: 0, label: t('fontNormal') },
    { value: 1, label: t('fontLarge') },
    { value: 2, label: t('fontXlarge') },
    { value: 3, label: 'AAA' },
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="inline-flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-ink-brand transition-colors hover:bg-surface-muted"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" />
        </svg>
        <span className="hidden sm:inline">{t('title')}</span>
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="absolute right-0 top-full z-[80] mt-2 w-72 rounded border border-edge bg-surface p-4 shadow-lifted"
      >
        <fieldset>
          <legend className="text-sm font-semibold text-ink-brand">{t('fontSize')}</legend>
          <div className="mt-2 flex gap-1" role="group">
            {fontSteps.map((step) => (
              <button
                key={step.value}
                type="button"
                onClick={() => update({ font: step.value })}
                aria-pressed={state.font === step.value}
                className={`flex-1 rounded border px-2 py-2 text-sm transition-colors ${
                  state.font === step.value
                    ? 'border-brand bg-brand text-ink-inverse'
                    : 'border-edge text-ink hover:border-brand'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-ink">{t('contrast')}</span>
          <button
            type="button"
            onClick={() => update({ contrast: !state.contrast })}
            aria-pressed={state.contrast}
            className={`rounded border px-3 py-2 text-sm transition-colors ${
              state.contrast ? 'border-brand bg-brand text-ink-inverse' : 'border-edge text-ink'
            }`}
          >
            {state.contrast ? t('enabled') : t('disabled')}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm text-ink">{t('hideImages')}</span>
          <button
            type="button"
            onClick={() => update({ images: !state.images })}
            aria-pressed={!state.images}
            className={`rounded border px-3 py-2 text-sm transition-colors ${
              !state.images ? 'border-brand bg-brand text-ink-inverse' : 'border-edge text-ink'
            }`}
          >
            {state.images ? t('disabled') : t('enabled')}
          </button>
        </div>

        <button
          type="button"
          onClick={() => update(DEFAULT_STATE)}
          className="mt-4 w-full rounded border border-edge px-3 py-2 text-sm text-ink-brand transition-colors hover:border-brand"
        >
          {t('reset')}
        </button>
      </div>
    </div>
  )
}
