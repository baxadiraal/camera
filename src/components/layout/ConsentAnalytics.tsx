'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const CONSENT_KEY = 'analytics-consent'

interface ConsentAnalyticsProps {
  /** Адрес self-hosted скрипта Umami/Plausible; пусто — аналитики нет вовсе */
  readonly scriptUrl?: string
  readonly websiteId?: string
  readonly provider?: 'umami' | 'plausible' | 'none'
}

/**
 * Баннер согласия и подключение аналитики.
 *
 * Правила, которые здесь соблюдаются:
 *   • счётчик — только self-hosted Umami или Plausible, никаких внешних систем;
 *   • скрипт добавляется с defer и лишь после явного согласия, поэтому
 *     в критический путь загрузки он не попадает ни при каких условиях;
 *   • отказ тоже запоминается — баннер больше не показывается.
 */
export function ConsentAnalytics({ scriptUrl, websiteId, provider = 'none' }: ConsentAnalyticsProps) {
  const t = useTranslations('consent')
  const [decision, setDecision] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored === 'granted' || stored === 'denied') setDecision(stored)
    } catch {
      // Без localStorage считаем, что решение не принято
    }
  }, [])

  // Скрипт монтируется только после согласия и только если он настроен
  useEffect(() => {
    if (decision !== 'granted' || provider === 'none' || !scriptUrl) return
    if (document.querySelector(`script[data-analytics="${provider}"]`)) return

    const script = document.createElement('script')
    script.src = scriptUrl
    script.defer = true
    script.dataset.analytics = provider
    if (provider === 'umami' && websiteId) script.dataset.websiteId = websiteId
    if (provider === 'plausible' && websiteId) script.dataset.domain = websiteId
    document.head.appendChild(script)
  }, [decision, provider, scriptUrl, websiteId])

  const decide = (value: 'granted' | 'denied') => {
    setDecision(value)
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      // Решение не сохранится, баннер появится снова — это допустимо
    }
  }

  if (decision !== 'unknown' || provider === 'none') return null

  return (
    <div
      role="region"
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-[85] border-t border-edge bg-surface p-4 shadow-lifted"
    >
      <div className="container-page flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-prose text-base text-ink">
          {t('text')}{' '}
          <Link href="/privacy" className="text-ink-accent underline underline-offset-4">
            {t('more')}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide('granted')}
            className="rounded bg-action px-5 py-3 text-base font-medium text-white hc-invert-text"
          >
            {t('accept')}
          </button>
          <button
            type="button"
            onClick={() => decide('denied')}
            className="rounded border border-edge-strong px-5 py-3 text-base font-medium text-ink-brand"
          >
            {t('decline')}
          </button>
        </div>
      </div>
    </div>
  )
}
