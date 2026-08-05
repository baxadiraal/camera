import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ExternalIcon, ServiceIcon } from '@/components/ui/ServiceIcon'
import type { ServiceItem } from '@/types/content'

/**
 * Сетка интерактивных услуг.
 *
 * Данные берутся из коллекции services — той же самой, из которой строится
 * колонка услуг в мега-меню. Второго списка в проекте нет: добавили услугу
 * в админке — она появилась и здесь, и в меню.
 */
export async function ServiceGrid({ services }: { readonly services: readonly ServiceItem[] }) {
  const t = await getTranslations('services')
  if (services.length === 0) return null

  return (
    <Section tone="sand" labelledBy="services-title">
      <SectionHeader id="services-title" title={t('title')} subtitle={t('subtitle')} />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const inner = (
            <>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-accent-soft text-ink-accent">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </span>
              <span className="flex items-start gap-1.5 text-base font-medium text-ink-brand">
                {service.title}
                {service.external && <ExternalIcon className="mt-1 h-4 w-4 shrink-0" />}
              </span>
              {service.description && (
                <span className="mt-2 block text-sm text-ink-muted">{service.description}</span>
              )}
            </>
          )

          const className =
            'flex h-full flex-col rounded border border-edge bg-surface p-5 transition-colors hover:border-brand'

          return (
            <li key={service.id}>
              {service.external ? (
                <a
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${service.title} — ${t('external')}`}
                  className={className}
                >
                  {inner}
                </a>
              ) : (
                <Link href={service.href} className={className}>
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
