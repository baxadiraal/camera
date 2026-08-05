import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export interface Crumb {
  readonly label: string
  /** У последней крошки ссылки нет — это текущая страница */
  readonly href?: string
}

/**
 * Хлебные крошки.
 *
 * Текущая страница помечена aria-current="page" и не является ссылкой.
 * Разметку Schema.org BreadcrumbList отдаёт компонент JsonLd рядом —
 * микроданные в самой вёрстке не смешиваются с семантикой для человека.
 */
export async function Breadcrumbs({ items }: { readonly items: readonly Crumb[] }) {
  const t = await getTranslations('breadcrumbs')
  const tCommon = await getTranslations('common')

  const crumbs: readonly Crumb[] = [{ label: tCommon('home'), href: '/' }, ...items]

  return (
    <nav aria-label={t('label')} className="border-b border-edge bg-surface-muted">
      <div className="container-page">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {index > 0 && (
                  <span aria-hidden="true" className="text-ink-muted">
                    /
                  </span>
                )}
                {isLast || !crumb.href ? (
                  <span aria-current="page" className="font-medium text-ink">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-ink-muted underline-offset-4 hover:text-ink-brand hover:underline"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
