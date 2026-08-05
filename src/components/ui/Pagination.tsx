import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

interface PaginationProps {
  readonly currentPage: number
  readonly totalPages: number
  /** Базовый путь без номера страницы, например «/news» */
  readonly basePath: string
}

/**
 * Постраничная навигация обычными ссылками: страницы остаются статическими
 * и открываются без JavaScript. Текущая страница помечена aria-current.
 */
export async function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const t = await getTranslations('pagination')
  if (totalPages <= 1) return null

  const href = (page: number) => (page === 1 ? basePath : `${basePath}?page=${page}`)

  // Показываем первую, последнюю и соседние страницы; остальное — многоточие
  const pages: number[] = []
  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages
    const isNear = Math.abs(page - currentPage) <= 1
    if (isEdge || isNear) pages.push(page)
  }

  return (
    <nav aria-label={t('label')} className="mt-10">
      <p className="visually-hidden" aria-live="polite">
        {t('status', { page: currentPage, total: totalPages })}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={href(currentPage - 1)}
              rel="prev"
              className="inline-flex h-11 items-center rounded border border-edge px-4 text-base text-ink-brand hover:border-brand"
            >
              {t('prev')}
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded border border-edge px-4 text-base text-ink-muted">
              {t('prev')}
            </span>
          )}
        </li>

        {pages.map((page, index) => {
          const previous = pages[index - 1]
          const gap = previous !== undefined && page - previous > 1
          const isCurrent = page === currentPage

          return (
            <li key={page} className="flex items-center gap-2">
              {gap && (
                <span aria-hidden="true" className="px-1 text-ink-muted">
                  …
                </span>
              )}
              {isCurrent ? (
                <span
                  aria-current="page"
                  aria-label={t('current', { page })}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded bg-brand px-3 text-base font-medium text-ink-inverse"
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={href(page)}
                  aria-label={t('page', { page })}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded border border-edge px-3 text-base text-ink-brand hover:border-brand"
                >
                  {page}
                </Link>
              )}
            </li>
          )
        })}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={href(currentPage + 1)}
              rel="next"
              className="inline-flex h-11 items-center rounded border border-edge px-4 text-base text-ink-brand hover:border-brand"
            >
              {t('next')}
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded border border-edge px-4 text-base text-ink-muted">
              {t('next')}
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
