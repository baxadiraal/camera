import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ExternalIcon, ServiceIcon } from '@/components/ui/ServiceIcon'
import type { QuickAction } from '@/types/content'

/**
 * Полоса быстрых действий: четыре плитки с самыми частыми задачами.
 * Список приходит из коллекции services (флаг isQuickAction) — отдельного
 * источника у полосы нет.
 */
export async function QuickActions({ actions }: { readonly actions: readonly QuickAction[] }) {
  const t = await getTranslations('quickActions')
  const tServices = await getTranslations('services')

  if (actions.length === 0) return null

  return (
    <section aria-labelledby="quick-actions-title" className="relative z-10 bg-surface">
      <h2 id="quick-actions-title" className="visually-hidden">
        {t('title')}
      </h2>
      <div className="container-page">
        <ul className="-mt-8 grid grid-cols-1 gap-px overflow-hidden rounded border border-edge bg-edge shadow-soft sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const content = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-sand text-ink-brand">
                  <ServiceIcon name={action.icon} className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-base font-medium text-ink-brand">
                    {action.title}
                    {action.external && <ExternalIcon className="h-4 w-4 shrink-0" />}
                  </span>
                  {action.hint && (
                    <span className="mt-1 block text-sm text-ink-muted">{action.hint}</span>
                  )}
                </span>
              </>
            )

            const className =
              'flex h-full items-start gap-4 bg-surface p-5 transition-colors hover:bg-surface-muted'

            return (
              <li key={action.id}>
                {action.external ? (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${action.title} — ${tServices('external')}`}
                    className={className}
                  >
                    {content}
                  </a>
                ) : (
                  <Link href={action.href} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
