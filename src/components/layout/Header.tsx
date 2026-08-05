import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { NavItem } from '@/types/content'
import { LangSwitcher } from './LangSwitcher'
import { MegaMenu } from './MegaMenu'
import { MobileMenu } from './MobileMenu'
import { SearchDialog } from './SearchDialog'
import { A11yToolbar } from './A11yToolbar'

interface HeaderProps {
  readonly nav: readonly NavItem[]
}

/**
 * Шапка сайта. Серверный компонент: разметка и тексты приходят готовыми,
 * клиентского кода ровно четыре островка — меню, мобильная панель,
 * поиск и тулбар доступности.
 *
 * Sticky-позиционирование сделано на уровне всей шапки, поэтому кнопка
 * «Поступление 2026» доступна с любой точки страницы.
 */
export async function Header({ nav }: HeaderProps) {
  const t = await getTranslations('header')
  const tSite = await getTranslations('site')

  return (
    <header className="sticky top-0 z-[70] border-b border-edge bg-surface">
      {/* Верхняя служебная полоса: язык и доступность */}
      <div className="border-b border-edge">
        <div className="container-page flex h-11 items-center justify-between gap-4">
          <LangSwitcher className="shrink-0" />
          <A11yToolbar />
        </div>
      </div>

      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label={tSite('fullName')}
        >
          {/* Герб — inline SVG, чтобы не тратить запрос на критическом пути */}
          <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true" focusable="false">
            <rect width="48" height="48" rx="8" className="fill-indigo" />
            <path
              d="M14 33V19l10-6 10 6v14"
              fill="none"
              stroke="#F5F1E8"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <circle cx="24" cy="25" r="3.5" className="fill-accent" />
          </svg>
          <span className="hidden text-sm font-semibold leading-[1.2] text-ink-brand sm:block sm:max-w-[220px]">
            {tSite('shortName')}
          </span>
        </Link>

        <nav aria-label={t('mainNav')} className="hidden lg:block">
          <MegaMenu items={nav} />
        </nav>

        <div className="flex items-center gap-2">
          <SearchDialog />
          <Link
            href="/admission"
            className="hidden rounded bg-action px-4 py-3 text-base font-medium text-white transition-colors hover:bg-action-hover hc-invert-text md:inline-flex"
          >
            {t('admissionCta')}
          </Link>
          <MobileMenu items={nav} ctaLabel={t('admissionCta')} ctaHref="/admission" />
        </div>
      </div>
    </header>
  )
}
