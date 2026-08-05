'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { localeLabels, localeNames, routing, type Locale } from '@/i18n/routing'

/**
 * Переключатель языка.
 *
 * Текстовые коды QQ / UZ / RU / EN — не флаги: флаг обозначает государство,
 * а не язык, и для каракалпакского корректного флага попросту нет.
 *
 * Ссылка ведёт на ту же страницу в другой локали, поэтому usePathname()
 * из next-intl — он отдаёт путь без языкового префикса.
 */
export function LangSwitcher({ className = '' }: { readonly className?: string }) {
  const t = useTranslations('header')
  const pathname = usePathname()
  const params = useParams()
  const current = (params.locale as Locale) ?? routing.defaultLocale

  return (
    <nav aria-label={t('languageLabel')} className={className}>
      <ul className="flex items-center gap-1">
        {routing.locales.map((locale) => {
          const isCurrent = locale === current
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={isCurrent ? 'true' : undefined}
                aria-label={
                  isCurrent
                    ? t('currentLanguage', { language: localeNames[locale] })
                    : t('switchTo', { language: localeNames[locale] })
                }
                className={`block rounded px-2 py-1.5 text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-brand text-ink-inverse'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink-brand'
                }`}
              >
                {localeLabels[locale]}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
