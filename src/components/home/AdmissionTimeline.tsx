import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Section, SectionHeader } from '@/components/ui/Section'
import { withStatuses } from '@/lib/admission'
import { formatDateRange } from '@/lib/format'
import type { AdmissionStage, AdmissionStatus } from '@/types/content'
import type { Locale } from '@/i18n/routing'

interface TimelineProps {
  readonly stages: readonly AdmissionStage[]
  readonly locale: Locale
}

/** Оформление статуса. Цвет — не единственный признак: рядом всегда есть текст. */
const STATUS_STYLES: Record<AdmissionStatus, { dot: string; badge: string; line: string }> = {
  past: {
    dot: 'bg-muted border-muted',
    badge: 'bg-surface text-ink-muted border-edge-strong',
    line: 'bg-edge-strong',
  },
  current: {
    dot: 'bg-accent border-accent',
    badge: 'bg-accent text-white border-transparent hc-invert-text',
    line: 'bg-edge-strong',
  },
  future: {
    dot: 'bg-surface border-edge-strong',
    badge: 'bg-surface text-ink-brand border-edge-strong',
    line: 'bg-edge-strong',
  },
}

/**
 * Горизонтальный таймлайн приёмной кампании.
 *
 * Разметка — упорядоченный список: этапы идут в хронологическом порядке,
 * и скринридер сообщает их номер. На узких экранах список разворачивается
 * вертикально, без горизонтального скролла и «каруселей».
 */
export async function AdmissionTimeline({ stages, locale }: TimelineProps) {
  const t = await getTranslations('timeline')
  if (stages.length === 0) return null

  const items = withStatuses(stages)
  const statusLabel: Record<AdmissionStatus, string> = {
    past: t('statusPast'),
    current: t('statusCurrent'),
    future: t('statusFuture'),
  }

  return (
    <Section tone="sand" labelledBy="timeline-title">
      <SectionHeader
        id="timeline-title"
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Link
            href="/admission"
            className="text-base font-medium text-ink-accent underline underline-offset-4"
          >
            {t('allStages')}
          </Link>
        }
      />

      <ol className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {items.map((stage, index) => {
          const styles = STATUS_STYLES[stage.status]
          const isLast = index === items.length - 1

          return (
            <li key={stage.id} className="relative flex flex-col">
              {/* Соединительная линия между точками — чисто декоративная */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(0.75rem+1px)] top-6 hidden h-px w-full ${styles.line} lg:block`}
                />
              )}

              <span
                aria-hidden="true"
                className={`relative z-10 mb-4 block h-6 w-6 rounded-pill border-4 ${styles.dot}`}
              />

              <span
                className={`mb-3 inline-flex w-fit items-center rounded-pill border px-3 py-1 text-sm font-medium ${styles.badge}`}
              >
                <span className="visually-hidden">{t('statusLabel')}: </span>
                {statusLabel[stage.status]}
              </span>

              <h3 className="text-lg font-semibold text-ink-brand">
                {stage.href ? (
                  <Link href={stage.href} className="underline-offset-4 hover:underline">
                    {stage.title}
                  </Link>
                ) : (
                  stage.title
                )}
              </h3>

              <p className="mt-1 text-sm font-medium text-ink">
                {formatDateRange(stage.startDate, stage.endDate, locale)}
              </p>

              {stage.description && (
                <p className="mt-2 text-sm text-ink-muted">{stage.description}</p>
              )}
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
