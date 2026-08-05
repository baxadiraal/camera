import { getTranslations } from 'next-intl/server'
import { Section, SectionHeader } from '@/components/ui/Section'
import { StatsCounter } from './StatsCounter'
import { formatNumber } from '@/lib/format'
import type { StatItem } from '@/types/content'
import type { Locale } from '@/i18n/routing'

/**
 * Обёртка серверного уровня: форматирование чисел по локали делается здесь,
 * чтобы клиентскому счётчику не тащить с собой Intl-логику и данные локали.
 * Год основания выводится без разделителя разрядов — это не количество.
 */
export async function StatsSection({
  stats,
  locale,
}: {
  readonly stats: readonly StatItem[]
  readonly locale: Locale
}) {
  const t = await getTranslations('stats')
  if (stats.length === 0) return null

  const formatted = stats.map((stat) =>
    stat.id === 'founded' || stat.value > 1900 ? String(stat.value) : formatNumber(stat.value, locale),
  )

  return (
    <Section tone="brand" labelledBy="stats-title">
      <SectionHeader id="stats-title" title={t('title')} subtitle={t('subtitle')} inverse />
      <StatsCounter stats={stats} formatted={formatted} />
    </Section>
  )
}
